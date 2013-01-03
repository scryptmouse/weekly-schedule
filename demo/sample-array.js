define(['zepto', 'underscore', 'sample'], function($, _, Sample) {

  var sample, data;

  data = [{
      "open": {"hour": 8, "minutes": 30},
      "close": {"hour": 20, "minutes": 30}
    },
    {"open": 7, "close": 22},
    {"open": 7, "close": 22},
    {"open": 7, "close": 22},
    {"open": 7, "close": 22},
    {"open": 7, "close": 22}
  ];

  sample = new Sample('scheduleWithArray', data);

  sample.addScript(
    '%name%.day("Saturday").isClosedAllDay;',
    '// #=> true',
    '',
    '// Each day has an isOpen method, and the week itself',
    '// has one that will be called on the current day.',
    '%name%.isOpen() === %name%.today().isOpen();',
    '// #=> true',
    '',
    '// isOpen supports an optional "at" parameter.',
    '// If passed a moment object, it will compare',
    '// against that instead of the current time.',
    'var noon_wednesday = moment().startOf("day").day(3).hour(12);',
    '%name%.isOpen(noon_wednesday);',
    '// #=> true'
  );

  sample.generate();

  return sample;

});
