vows = require 'vows'
assert = require 'assert'
_ = require 'underscore'
fixtures = require './fixtures.json'

Helpers = {}

Helpers.clone = clone = (o) ->
  return JSON.parse(JSON.stringify(o || {}))

Helpers.assertOnRange = assertOnRange = ->
  args = _.toArray arguments
  assertMethod = args.shift()
  objectMethod = args.shift()

  (d, range) ->
    _(range).each (time) ->
      assert[assertMethod].apply(assert, [d[objectMethod](time)].concat(args))

Helpers.assertJSON = (matches) ->
  (o) ->
    assert.deepEqual clone(o), matches

Helpers.assertIsTrueOnRangeWith = (method) ->
  assertOnRange('isTrue', method)

Helpers.assertIsFalseOnRangeWith = (method) ->
  assertOnRange('isFalse', method)

Helpers.assertEqualsOnRangeWith = (method, equalTo) ->
  assertOnRange('equals', method, equalTo)

Helpers.getFixture = Helpers.fixture = getFixture = (key) ->
  return clone fixtures[key]

Helpers.has7 = ->
  args = _.toArray arguments
  obj = args.shift()

  suite = {}

  _.each args, (property) ->
    suite[''+property] = ->
      assert.equal _.size(obj[property]), 7
  return suite

module?.exports = Helpers
