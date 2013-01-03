require 'coffee-script'

vows = require 'vows'
assert = require 'assert'
_ = require 'underscore'

vh = require './vow-helpers'
{DayHelper} = require '../src/schedule'

assertFindByList = (list) ->
  suite =
    topic: ->
      list
    'returns a day for each needle': (needles) ->
      for needle in needles then do (needle) ->
        assert.instanceOf(DayHelper.find(needle), DayHelper)
  return suite

vows
  .describe('DayHelper')
  .addBatch
    'has seven': vh.has7 DayHelper, 'days', 'names', 'Names'

    'using find() with a(n)':
      'index': assertFindByList _.range(0, 7)
      'full name': assertFindByList DayHelper.names
      'abbreviated name': assertFindByList _(DayHelper.days).pluck('short')
      'unknown search term':
        topic: ->
          @callback(DayHelper.find('some unknown term'))

        'returns undefined': (day) ->
          assert.isUndefined(day)

    'get()':
      'can find a name with an index': ->
        assert.equal(DayHelper.get(0, 'Name'), 'Sunday')
        assert.equal(DayHelper.get(1, 'name'), 'monday')

      'can find an index with a name': ->
        assert.equal(DayHelper.get('Wednesday', 'index'), 3)
        assert.equal(DayHelper.get('thu', 'index'), 4)

      'returns the DayHelper given no property': ->
        assert.instanceOf(DayHelper.get(1), DayHelper)

      'returns undefined on unknown properties or days': ->
        assert.isUndefined(DayHelper.get('Caturday', 'index'))
        assert.isUndefined(DayHelper.get('Saturday', 'unknown prop'))

    'getCurrentDay()':
      topic: -> DayHelper.getCurrentDay()

      'returns a DayHelper': (day) ->
        assert.instanceOf(day, DayHelper)
        assert.equal(day.index, (new Date()).getDay())

  .export(module)
