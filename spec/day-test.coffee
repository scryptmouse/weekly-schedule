require 'coffee-script'

vows = require 'vows'
assert = require 'assert'
moment = require 'moment'
_ = require 'underscore'

fixtures = require './fixtures.json'
h = require './vow-helpers'

{Day, DayHelper} = require '../src/schedule'

vows
  .describe('Day')
  .addBatch
    'Instantiation (Sunday 8:30 - 8:30)':
      topic: ->
        validParams = h.getFixture('day-test-sunday')
        return new Day(validParams)

      'is open at 9 AM': (d) ->
        nine_am = moment().day(0).hours(9)
        assert.isTrue(d.isOpen(nine_am))

      'is closed at 11 PM': (d) ->
        eleven_pm = moment().day(0).hours(23)
        assert.isFalse(d.isOpen(eleven_pm))

      'name is set correctly': (d) -> assert.equal(d.name, 'Sunday')

      'isSunday': (d) -> assert.isTrue(d.isSunday())

      "converts to json": h.assertJSON(h.getFixture('day-test-sunday-json'))

      'converts to string': (d) ->
        assert.match(''+d, /Sunday: 8:30\s?AM - 8:30\s?PM/i);

      'getOpenRange':
        topic: (d) ->
          @callback(d, d.getOpenRange())

        'is open given its own range': h.assertIsTrueOnRangeWith('isOpen')

    'open all day':
      topic: -> return new Day(h.getFixture('open_all_day'))

      'isOpenAllDay': (d) -> assert.isTrue(d.isOpenAllDay)

      'converts to json': h.assertJSON(h.getFixture('open_all_day-json'))

      'converts to string': (d) ->
        assert.match(''+d, /open 24 hours/i)

      'getOpenRange':
        topic: (d) -> @callback(d, d.getOpenRange())

        'returns a 24-hour range': (d, range) -> assert.lengthOf(range, 24)

        'day isOpen 24 hours': h.assertIsTrueOnRangeWith('isOpen')

    'closed all day':
      topic: -> return new Day(h.getFixture('closed_all_day'))

      'isClosedAllDay': (d) -> assert.isTrue d.isClosedAllDay

      'converts to json': h.assertJSON(h.getFixture('closed_all_day-json'))

      'converts to string': (d) ->
        assert.match(''+d, /closed/i)

      'getOpenRange':
        topic: (d) -> @callback(d, d.getOpenRange())

        'returns a 0-length range': (d, range) -> assert.lengthOf(range, 0)

        'is not open at any time': h.assertIsFalseOnRangeWith('isOpen')

    'Day factory':
      topic: -> Day.factory({close: false}, 3)

      'returns instance of Day': (d) ->
        assert.instanceOf(d, Day)

      'sets day correctly': (d) ->
        assert.isTrue(d.isWednesday())
        assert.equal(d.day, 3)
        assert.matches(d.name, /wednesday/i)

      'sets points correctly': (d) ->
        assert.isNull(d.open)
        assert.isNull(d.close)
        assert.isTrue(d.isOpenAllDay)
        assert.isFalse(d.isClosedAllDay)

    # Iteratively generate isSunday, isMonday, etc tests
    'is day boolean methods:': do ->
      isMethods = _(DayHelper.Names).map (s) -> "is#{s}"

      return _.reduce(DayHelper.Names, (suite, name, idx) ->
        isMethod = "is#{name}"
        otherMethods = _(isMethods).without(isMethod)

        suite[isMethod] =
          topic: -> new Day(day: idx)

        suite[isMethod]["is true on #{name} and false otherwise"] = (d) ->
          assert.isTrue d[isMethod]()

          _.each otherMethods, (otherMethod) ->
            assert.isFalse d[otherMethod]()

        return suite
      {})
  .export(module)
