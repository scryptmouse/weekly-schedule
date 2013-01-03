# simple-schedule
### A simple weekly schedule library
A straightforward prototype for defining a weekly schedule in javascript, that can be queried with `moment`, `Date`, and unix timestamps.

Presently, it supports basic isOpen, isClosed functionality.

It transparently uses AMD or CommonJS (in node.js), or it will attach itself to the global object in other instances as `SimpleSchedule`. It requires [underscore.js] (http://underscorejs.org/ "Underscore.js") and [moment](http://momentjs.com/ "Moment.js | Parse, validate, manipulate, and display dates in javascript.").

## Example
    var schedule = new SimpleSchedule(json_schedule);

    // Assuming you're open at noon on Tuesdays…
    var tuesday_at_noon = moment().hours(12).day(2);

    schedule.isOpen(tuesday_at_noon);
    // #=> true
    schedule.isClosed(tuesday_at_noon);
    // #=> false

    // ... and closed in the middle of the night
    var middle_of_the_night = tuesday_at_noon.clone().add('hours', 13)

    schedule.isOpen(middle_of_the_night);
    // #=> false
    schedule.isClosed(middle_of_the_night);
    // #=> true

    // If no time is provided, it will default to the current time.
    schedule.isOpen();
    // #=> true / false depending


* [annotated source code](http://scryptmouse.github.com/simple-schedule/src/schedule.coffee "Annotated source code")
* [demo](http://scryptmouse.github.com/simple-schedule/demo/index.htm "simple-schedule demo")

## Todo
* Timezone support for client-side usage
* Holidays / events
* Multiple open / close points (e.g. closed for lunch)

## License
Copyright (c) 2012 Alexa Grey

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

