require 'coffee-script'

vows = require 'vows'
assert = require 'assert'
moment = require 'moment'
_ = require 'underscore'

vh = require './vow-helpers'

Week = require '../src/schedule'
Day = Week.Day

TestHelpers = {}

TestHelpers.assertClosed = assertClosed = (needle) ->
  test = {}

  test.topic = (w) ->
    return w.day(needle)

  test["is closed on #{needle}"] = isClosedAllDay

  return test

TestHelpers.onDays = onDays = ->
  args = _.toArray arguments
  fn = args.shift()
  days = _.flatten args

  return _(days).reduce((o, day) ->
    o[day] = fn(day)

    return o
  {})

TestHelpers.assertIsDay = assertIsDay = (d) ->
  assert.isObject(d)
  assert.instanceOf(d, Day)

TestHelpers.isClosedAllDay = isClosedAllDay = (d) ->
  assertIsDay(d)
  assert.isFalse(d.isOpen())
  assert.isTrue(d.isClosedAllDay)

TestHelpers.isOpenAtNoon = (d) ->
  m = moment().startOf('day').hours(12).day(d.day)
  assert.isObject(d)
  assert.isTrue(d.isOpen(m))

# Create a test suite for a Week based on a fixture.
# Any additional arguments / tests get added to the suite
# with _.extend.
TestHelpers.testWeekByFixture = testWeekByFixture = ->
  args = _.toArray arguments
  params = vh.getFixture(args.shift())
  suite = {}

  suite.topic = ->
    return new Week(params)

  suite['has seven days'] = (w) ->
    days = w.getDays()

    assert.isObject days
    assert.equal _.size(days), 7

    _(days).each(assertIsDay)

  suite['serializes properly'] = (w) ->
    serialized = w.toJSON()

    assert.isArray(serialized)
    assert.lengthOf(serialized, 7)

    _.each serialized, (day) ->
      assert.isTrue _(day).has 'day'
      # OpenAllDay/ClosedAllDay will only have property, close / open respectively.
      assert.isTrue _(day).has 'open' or _(day).has 'close'

  return _.extend.apply(null, [suite].concat(args))

module?.exports = TestHelpers
