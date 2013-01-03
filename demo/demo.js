require({
  paths: {
    'underscore': 'vendor/underscore',
    'moment': 'vendor/moment',
    'zepto': 'vendor/zepto',
    'rainbow': 'vendor/rainbow.min',
    'bootstrap': 'vendor/bootstrap.min',
    'schedule': '../dist/schedule.min'
  },

  shim: {
    'zepto': {
      exports: '$',

      init: function() {
        this.jQuery = this.Zepto;

        return this.Zepto;
      }
    },
    'rainbow': {
      exports: 'Rainbow'
    },
    'bootstrap': ['zepto']
  }
},
['zepto', 'rainbow', 'sample-object', 'sample-array', 'schedule'],
function($, Rainbow, sample_with_object, sample_with_array, WeeklySchedule) {
  'use strict';
  $(function() {
    sample_with_object.render('#sample_with_object');
    sample_with_array.render('#sample_with_array');
    window.WeeklySchedule = WeeklySchedule;

    $('p code[data-language]').each(function() {
      var $this = $(this);

      Rainbow.color($this.text(), $this.data('language'), function(highlighted) {
        $this.html(highlighted);
      });
    });
  });
});
