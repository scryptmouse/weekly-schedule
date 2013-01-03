require 'coffee-script'
vows = require 'vows'
assert = require 'assert'
moment = require 'moment'
vh = require './vow-helpers'
wh = require './week-test-helpers'
_ = require 'underscore'

Week = require '../src/schedule'

each_day_is_open_at_noon =
  'each day is open at noon': (w) ->
    wh.isOpenAtNoon(day) for day in w.getDays()

vows
  .describe('Week')
  .addBatch
    instantiation:
      'with no parameters': wh.testWeekByFixture(null,
        'defaults to closed all week': (w) -> wh.isClosedAllDay(day) for day in w.getDays()
      )

      'with an object': wh.testWeekByFixture 'by_name', each_day_is_open_at_noon

      'with an array': wh.testWeekByFixture 'by_array', each_day_is_open_at_noon

      'with an incomplete object': wh.testWeekByFixture('by_name_missing_tues_and_thurs',
        'missing the definition for': wh.onDays wh.assertClosed, 'tuesday', 'thursday'
      )
  .export(module)
