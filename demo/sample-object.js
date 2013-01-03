define(['zepto', 'underscore', 'sample'], function($, _, Sample) {
  'use strict';

  var sample, data;

  data = {
    "sunday":    {"open": "8:30", "close": "8:30"},
    "monday":    {"open": 7, "close": 22},
    "tuesday":   {"open": 7, "close": 10},
    "wednesday": {"open": 7, "close": "10 PM"},
    "thursday":  {"open": 7, "close": 22},
    "friday":    {"open": "4 PM", "close": 22},
    "saturday":  {"open": 7, "close": "11 AM"}
  };

  sample = new Sample('scheduleWithObject', data);

  sample.addScript(
    '// Access a day by name or index with .day(needle)',
    '// Closed times assume PM, even if fed an hour less than twelve.',
    '%name%.day("tue").close.getHour();',
    '// #=> 22', '',
    '// An explicit AM / PM declaration will override the assumption.',
    '%name%.day(5).open.getHour(); // Friday',
    '// #=> 16',
    '%name%.day("Saturday").close.getHour();',
    '// #=> 11'
  );

  sample.generate();

  return sample;
});
