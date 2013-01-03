require 'coffee-script'

vows = require 'vows'
assert = require 'assert'
moment = require 'moment'
_ = require 'underscore'

vh = require './vow-helpers'

{Point} = require '../src/schedule'

vows
  .describe('Point')
  .addBatch
    'default instantiation':
      topic: -> new Point()

      'is midnight of current day': (p) ->
        assert.equal(p.day, (new Date()).getDay())
        assert.equal(p.getHour(), 0)
        assert.equal(p.getMinutes(), 0)

      'stringifies to 12:00 AM': (p) ->
        assert.equal(''+p, '12:00 AM')

      'converts to JSON': vh.assertJSON({hour: 0, minutes: 0})

    'Point.open(8)':
      topic: -> Point.open 8

      'has default "am"': (p) -> assert.equal(p.defaultAMPM, 'am')

      'is set properly': (p) ->
        assert.equal(p.getHour(), 8)
        assert.equal(p.getMinutes(), 0)

      'is valid': (p) -> assert.isTrue(p.isValid())

    'Point.close("9:30")':
      topic: -> Point.close "9:30"

      'has default "pm"': (p) -> assert.equal(p.defaultAMPM, 'pm')

      'is set correctly': (p) ->
        assert.equal(p.getHour(), 21)
        assert.equal(p.getMinutes(), 30)

      'is valid': (p) -> assert.isTrue(p.isValid())

    'isBefore() and isAfter() (using 11 AM as base time)':
      topic: -> Point.open 11

      '2 hours later':
        topic: (p) -> @callback(p, p.moment().add('hours', 2))

        'is before': (p, later) ->
          assert.isTrue(p.isBefore(later))
          assert.isFalse(p.isAfter(later))

      '2 hours earlier':
        topic: (p) -> @callback(p, p.moment().subtract('hours', 2))

        'is after': (p, earlier) ->
          assert.isTrue(p.isAfter(earlier))
          assert.isFalse(p.isBefore(earlier))
  .export(module)
