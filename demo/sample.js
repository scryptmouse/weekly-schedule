define(['zepto', 'underscore', 'schedule', 'rainbow', 'json_tree'], function($, _, SimpleSchedule, Rainbow) {
  'use strict';

  function Sample(name, data) {
    this.setName(name);
    this.data = data || {};
    this.schedule = null;
  }

  Sample.prototype.generate = function() {
    this.schedule = new SimpleSchedule(this.data);
    if (window) {
      window[this.name] = this.schedule;
      window[this.name+'Data'] = this.data;
    }
  };

  Sample.prototype.addScript = function() {
    var strings = _.flatten(arguments).join('\n');

    strings = strings.
      replace(/%name%/g, this.name).
      replace(/%dataName%/gm, this._dataName);

    this.script += strings + "\n";

    return this;
  };

  Sample.prototype.setEl = function(el) {
    this.$el = $(el);
  };

  Sample.prototype.setName = function(name) {
    var dataName;

    if (!name) return;
    if (this.name && window) {
      delete window[this.name];
      delete window[this._dataName];
    }

    this.name = name;
    this.script = '';
    this._dataName = dataName = this.name+'Data';

    this.addScript(
      '// Accessible on the window with these names.',
      'var %name% = new SimpleSchedule(%dataName%);',
      ''
    );
  };

  Sample.prototype.renderJS = function() {
    $('.js-box code', this.$el).text(this.script);

    return this;
  };

  Sample.prototype.renderJSON = function() {
    //$('.json-box', this.$el).json_pp(this.data);
    var $div = $('<div />').addClass('json-tree-container').json_tree(this.data);

    $('.json-box', this.$el).html($div.asHtml());

    return this;
  };

  Sample.prototype.render = function(el) {
    if (el)
      this.setEl(el);

    this.renderJS().renderJSON();
    Rainbow.color();
  };

  return Sample;
});
