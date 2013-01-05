# # WeeklySchedule
"use strict"
factory = (require, exports, module) ->
  if require?
    moment = require 'moment'
    _ = require 'underscore'
  else if window?
    {moment, _} = window

  # ## Schedule Helpers

  dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  Helpers = {}

  Helpers.currentDay = currentDay = ->
    (new Date())?.getDay()

  # Generate an array of `moment` objects based on a range.
  # Will default to 24 hours (0000-2300) on Sunday (dayIndex 0).
  Helpers.rangeOfMoments = Helpers.range = rangeOfMoments = (dayIndex = 0, start = 0, end = 24, startMinutes = 0, endMinutes = 0) ->
    range = _(start).chain().range(end).map((hour) ->
      return moment().day(dayIndex).hours(hour).minutes(0)
    ).value()

    # Set the first and last `moment` objects to specific minutes if defined.
    range[0].minutes(startMinutes) if startMinutes
    range[range.length-1].minutes(endMinutes) if endMinutes

    return range

  # Quick and dirty JSON cloning
  clone = (o = {}) ->
    JSON.parse(JSON.stringify(o))

  ucfirst = (s) ->
    s = ''+s
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

  # # DayHelper
  # `DayHelper` facilitates easy matching of a day,
  # and is used throughout the library.
  class DayHelper
    constructor: (Name, index) ->
      @index = index

      @Name = ucfirst(Name)
      @name = Name.toLowerCase()
      @short = @name.slice(0, 3)
      @Short = ucfirst(@short)

    # Return capitalized name
    toString: -> @Name

    # Return day index
    valueOf: -> @index

    # For use with _.map
    @factory: (name, index) ->
      return new DayHelper(name, index)

    # ### Finders
    # `find` is designed to be very flexible. It can be passed any parameter used
    # to define a day, and will return the corresponding DayHelper object if one
    # exists.
    @find = _.memoize (needle) =>
      return _(@days).find (day) ->
        return _(day).contains(needle)

    # Safe wrapper around find to extract a property.
    # If unknown needle or property, returns `undefined`.
    @get = (needle, property) =>
      day = @find(needle)

      if day? and property?
        day[property]
      else
        day

    # #### Current Day finder methods
    # Return the DayHelper for the current day
    @getCurrentDay = =>
      @find(currentDay())

    # Wrapper around `get()` that uses the current
    # day index as needle.
    @getCurrent = (property) =>
      @get(currentDay(), property)

    # Generate days
    @days = _.map dayNames, @factory

    # Export 'name' properties
    @Names = dayNames
    @names = _(@days).pluck('name')

  # These functions are assigned to variables for
  # less typing and better mangling when minified.
  dh_find = DayHelper.find
  dh_get = DayHelper.get

  # # Point
  # Representing a point in time, e.g. open or close
  class Point
    constructor: (time = 0, day) ->
      @setTime(time)
      @setDay(day)

    # defaultAMPM is blank.
    defaultAMPM: ''

    # Set the day index of the Point, as it's used to
    # generate the `moment`.
    setDay: (day) ->
      day = currentDay() unless day?
      @day = +day
      return @

    # Parses a given time and sets it if it is valid.
    setTime: (time) ->
      parsed = @parse(time)

      @time = parsed if validateTime(parsed)

      return @

    # Get the hour (0-23)
    getHour: -> @time?.hour or 0

    # Get the minutes (0-59)
    getMinutes: -> @time?.minutes or 0

    isValid: -> validateTime @time

    # parse a string or numerical time into a
    # proper object if possible, or return
    # an invalid time
    parse: (time = false) ->
      if _.isNumber(time) or _.isString(time)
        return parseFromString(time, @defaultAMPM)
      else if _.isObject(time)
        return _(time).pick('hour', 'minutes')
      else
        return {hour: null, minutes: 0}

    # Return a `moment` set to this point in time.
    moment: ->
      moment().startOf('day').day(@day).hours(@getHour()).minutes(@getMinutes())

    # ### Comparison functions
    # For use with 'open' times.
    isBefore: (time) ->
      @moment().diff(time, 'minutes') <= 1

    # #### isAfter `(time)`
    # compare against -1 to account for
    # `moment.fn.diff`'s rounding on seconds.
    isAfter: (time) ->
      @moment().diff(time, 'minutes') >= -1

    toJSON: ->
      _(@time).pick 'hour', 'minutes'

    toString: ->
      @moment().format('h:mm A')

    validateTime = (time = {}) ->
      # time must be defined and have hour property
      return false unless time? and time.hour?
      # hour must be within a valid range
      return false if 0 > time.hour or time.hour > 23
      # minutes must be within a valid range
      return false if time.minutes? and (0 > time.minutes or time.minutes > 59)

      return true

    hoursRgx = /^([0-2]?\d):?([0-5]\d)?\s?([aApP][mM])?$/

    parseFromString = (s, defaultAMPM = '') ->
      # Coerce to string
      s = ''+s

      time = {hour: null, minutes: null}

      matches = s.match(hoursRgx)

      if matches
        time.hour = +matches[1]
        time.minutes = +matches[2] || 0

        ampm = (matches[3] || defaultAMPM).toLowerCase()

        isPM = (ampm is 'pm')

        if isPM and time.hour < 12
          time.hour += 12

      return time

  class OpenPoint extends Point
    defaultAMPM: 'am'

  Point.Open = OpenPoint

  Point.open = (time, day) ->
    return new OpenPoint(time, day)

  class ClosePoint extends Point
    defaultAMPM: 'pm'

  Point.Close = ClosePoint

  Point.close = (time, day) ->
    return new ClosePoint(time, day)

  # # Day
  # Generic day class.
  # It has `open` and `close` properties (that are an `OpenPoint` and `ClosePoint` respectively)
  # If no or an invalid time is provided, it will default to being closed all day.
  class Day
    constructor: (params = {}) ->
      params = clone params
      @setDayAndName(params.day)
      @setTimes(params)

    getOpenRange: ->
      # args for rangeOfMoments
      # 0: day, 1: start, 2: end, 3: startMinutes, 4: endMinutes
      args = [@day]

      if @isOpenAllDay
        args[1] = 0
        args[2] = 24
      else if @isClosedAllDay
        args[1] = 0
        args[2] = -1
      else
        om = @open.moment()
        cm = @close.moment()
        args[1] = om.hours()
        # Must add 1 to closing hour for _.range
        args[2] = cm.hours() + 1
        args[3] = om.minutes()
        args[4] = cm.minutes()

      return rangeOfMoments.apply(null, args)

    isClosedAllDay: false

    isOpenAllDay: false

    # Support an optional `now` argument that can be a
    # `moment`, `Date`, or unix timestamp. Will default
    # to the current time if not provided.
    isOpen: (now) ->
      unless now and moment.isMoment(now)
        if now
          if _.isDate(now)
            now = moment(now)
          else if _.isFinite(+now)
            now = moment(+now)
        else
          now = moment()

      if @isClosedAllDay or (now.day() isnt @day)
        false
      else if @isOpenAllDay
        true
      else
        @open?.isBefore?(now) and @close?.isAfter?(now)

    isClosed: (now = false) ->
      !@isOpen(now)

    setDayAndName: (day) ->
      day = DayHelper.get(day)

      @day = day?.index
      @name = day?.Name
      @

    setTimes: (params) ->
      if ((params.open or params.close) and (params.close isnt false and params.open isnt false))
        setOpenAndClose this, params
      else if (params.close is false)
        setOpenAllDay this
      else
        setClosedAllDay this
      @

    tomorrow: ->
      return if (@day == 6) then 0 else @day + 1

    yesterday: ->
      return if (@day == 0) then 6 else @day - 1

    toJSON: ->
      params = {day: @day}

      if @isOpenAllDay
        params.close = false
      else if @isClosedAllDay
        params.open = false
      else
        params.open = @open.toJSON()
        params.close = @close.toJSON()

      return params

    toString: ->
      if @isOpenAllDay
        "#{@name}: Open 24 Hours"
      else if @isClosedAllDay
        "#{@name}: Closed"
      else
        return "#{@name}: #{@open} - #{@close}"

    # Iteratively generate isDay methods, e.g. isSunday, isMonday
    _.extend @prototype, do ->
      _(dayNames).reduce((functions, name, idx) ->
        functions["is#{name}"] = ->
          @day == idx

        functions
      {})

    # Factory method for use with _.map
    @factory: (params, idx) ->
      params = {open: false} unless params
      params = clone params

      unless _(params).has('day')
        params.day = +idx

      new Day(params)

    # ### Private setters
    setOpenAndClose = (day, params) ->
      day.isOpenAllDay = day.isClosedAllDay = false
      setOpen(day, params.open)
      setClose(day, params.close)

    setClose = (day, close) ->
      close ||= "23:59"
      day.close = Point.close(close, day.day)

    setOpen = (day, open) ->
      open ||= 0
      day.open = Point.open(open, day.day)

    setOpenAllDay = (day) ->
      day.open = day.close = null
      day.isOpenAllDay = true
      day.isClosedAllDay = false

    setClosedAllDay = (day) ->
      day.open = day.close = null
      day.isOpenAllDay = false
      day.isClosedAllDay = true

  # # Week
  # Main schedule class.
  class Week
    constructor: (params) ->
      params ||= generate_base_days()

      @setDays params

    day: (needle) ->
      @getDays()[dh_get(needle, 'Name')]

    getDays: -> @__days

    setDays: (days) ->
      @__days = {}

      if _.isArray(days)
        newDays = _(array_defaults(days)).map Day.factory

        _(dayNames).each((dayName) ->
          idx = dh_get(dayName, 'index')

          @[dayName] = newDays[idx]
        @__days)
      else
        @setDays obj_to_array(days)

      return this

    today: ->
      return @day currentDay()

    isClosed: (now) -> @today().isClosed(now)

    isOpen: (now = false) ->
      if now? and moment.isMoment(now)
        @day(now.day())?.isOpen(now)
      else
        @today().isOpen(now)

    toJSON: ->
      _.invoke(@getDays(), 'toJSON')

    toString: (useHTML = false) ->
      _(@getDays()).map(String).join('\n')

    # Return an object to use as the base `__days` property.
    generate_base_days = ->
      Sunday: false
      Monday: false
      Tuesday: false
      Wednesday: false
      Thursday: false
      Friday: false
      Saturday: false

    # Given an array containing schedule options under an index,
    # return an array that fills in any undefined indices with
    # the default `{open: false}`.
    array_defaults = (array_of_days) ->
      array_of_days = _.toArray(array_of_days) unless _.isArray(array_of_days)

      _(0).chain().range(7).map((idx) ->
        array_of_days[idx] or {open: false}
      ).value()

    # Convert an object with day names as keys to an array
    # with the day's corresponding index holding the value
    obj_to_array = (o = {}) ->
      _(o).reduce((indexed_days, values, key) ->
        idx = dh_get(key, 'index')

        indexed_days[idx] = values if idx?

        indexed_days
      [])

    # Export other classes for unit testing.
    @Day = Day
    @DayHelper = DayHelper
    @Helpers = Helpers
    @Point = Point

  if module?
    module.exports = Week

  return Week

if define?.amd?
  define factory
else if module?
  factory require, module.exports, module
else
  @WeeklySchedule = factory()
