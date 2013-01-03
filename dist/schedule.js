(function() {
  "use strict";

  var factory,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  factory = function(require, exports, module) {
    var ClosePoint, Day, DayHelper, Helpers, OpenPoint, Point, Week, clone, currentDay, dayNames, dh_find, dh_get, moment, rangeOfMoments, ucfirst, _;
    if (require != null) {
      moment = require('moment');
      _ = require('underscore');
    } else if (typeof window !== "undefined" && window !== null) {
      moment = window.moment, _ = window._;
    }
    dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    Helpers = {};
    Helpers.currentDay = currentDay = function() {
      var _ref;
      return (_ref = new Date()) != null ? _ref.getDay() : void 0;
    };
    Helpers.rangeOfMoments = Helpers.range = rangeOfMoments = function(dayIndex, start, end, startMinutes, endMinutes) {
      var range;
      if (dayIndex == null) {
        dayIndex = 0;
      }
      if (start == null) {
        start = 0;
      }
      if (end == null) {
        end = 24;
      }
      if (startMinutes == null) {
        startMinutes = 0;
      }
      if (endMinutes == null) {
        endMinutes = 0;
      }
      range = _(start).chain().range(end).map(function(hour) {
        return moment().day(dayIndex).hours(hour).minutes(0);
      }).value();
      if (startMinutes) {
        range[0].minutes(startMinutes);
      }
      if (endMinutes) {
        range[range.length - 1].minutes(endMinutes);
      }
      return range;
    };
    clone = function(o) {
      if (o == null) {
        o = {};
      }
      return JSON.parse(JSON.stringify(o));
    };
    ucfirst = function(s) {
      s = '' + s;
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    };
    DayHelper = (function() {
      var _this = this;

      function DayHelper(Name, index) {
        this.index = index;
        this.Name = ucfirst(Name);
        this.name = Name.toLowerCase();
        this.short = this.name.slice(0, 3);
        this.Short = ucfirst(this.short);
      }

      DayHelper.prototype.toString = function() {
        return this.Name;
      };

      DayHelper.prototype.valueOf = function() {
        return this.index;
      };

      DayHelper.factory = function(name, index) {
        return new DayHelper(name, index);
      };

      DayHelper.find = _.memoize(function(needle) {
        return _(DayHelper.days).find(function(day) {
          return _(day).contains(needle);
        });
      });

      DayHelper.get = function(needle, property) {
        var day;
        day = DayHelper.find(needle);
        if ((day != null) && (property != null)) {
          return day[property];
        } else {
          return day;
        }
      };

      DayHelper.getCurrentDay = function() {
        return DayHelper.find(currentDay());
      };

      DayHelper.getCurrent = function(property) {
        return DayHelper.get(currentDay(), property);
      };

      DayHelper.days = _.map(dayNames, DayHelper.factory);

      DayHelper.Names = dayNames;

      DayHelper.names = _(DayHelper.days).pluck('name');

      return DayHelper;

    }).call(this);
    dh_find = DayHelper.find;
    dh_get = DayHelper.get;
    Point = (function() {
      var hoursRgx, parseFromString, validateTime;

      function Point(time, day) {
        if (time == null) {
          time = 0;
        }
        this.setTime(time);
        this.setDay(day);
      }

      Point.prototype.defaultAMPM = '';

      Point.prototype.setDay = function(day) {
        if (day == null) {
          day = currentDay();
        }
        this.day = +day;
        return this;
      };

      Point.prototype.setTime = function(time) {
        var parsed;
        parsed = this.parse(time);
        if (validateTime(parsed)) {
          this.time = parsed;
        }
        return this;
      };

      Point.prototype.getHour = function() {
        var _ref;
        return ((_ref = this.time) != null ? _ref.hour : void 0) || 0;
      };

      Point.prototype.getMinutes = function() {
        var _ref;
        return ((_ref = this.time) != null ? _ref.minutes : void 0) || 0;
      };

      Point.prototype.isValid = function() {
        return validateTime(this.time);
      };

      Point.prototype.parse = function(time) {
        if (time == null) {
          time = false;
        }
        if (_.isNumber(time) || _.isString(time)) {
          return parseFromString(time, this.defaultAMPM);
        } else if (_.isObject(time)) {
          return _(time).pick('hour', 'minutes');
        } else {
          return {
            hour: null,
            minutes: 0
          };
        }
      };

      Point.prototype.moment = function() {
        return moment().startOf('day').day(this.day).hours(this.getHour()).minutes(this.getMinutes());
      };

      Point.prototype.isBefore = function(time) {
        return this.moment().diff(time, 'minutes') <= 1;
      };

      Point.prototype.isAfter = function(time) {
        return this.moment().diff(time, 'minutes') >= -1;
      };

      Point.prototype.toJSON = function() {
        return _(this.time).pick('hour', 'minutes');
      };

      Point.prototype.toString = function() {
        return this.moment().format('h:mm A');
      };

      validateTime = function(time) {
        if (time == null) {
          time = {};
        }
        if (!((time != null) && (time.hour != null))) {
          return false;
        }
        if (0 > time.hour || time.hour > 23) {
          return false;
        }
        if ((time.minutes != null) && (0 > time.minutes || time.minutes > 59)) {
          return false;
        }
        return true;
      };

      hoursRgx = /^([0-2]?\d):?([0-5]\d)?\s?([aApP][mM])?$/;

      parseFromString = function(s, defaultAMPM) {
        var ampm, isPM, matches, time;
        if (defaultAMPM == null) {
          defaultAMPM = '';
        }
        s = '' + s;
        time = {
          hour: null,
          minutes: null
        };
        matches = s.match(hoursRgx);
        if (matches) {
          time.hour = +matches[1];
          time.minutes = +matches[2] || 0;
          ampm = (matches[3] || defaultAMPM).toLowerCase();
          isPM = ampm === 'pm';
          if (isPM && time.hour < 12) {
            time.hour += 12;
          }
        }
        return time;
      };

      return Point;

    })();
    OpenPoint = (function(_super) {

      __extends(OpenPoint, _super);

      function OpenPoint() {
        return OpenPoint.__super__.constructor.apply(this, arguments);
      }

      OpenPoint.prototype.defaultAMPM = 'am';

      return OpenPoint;

    })(Point);
    Point.Open = OpenPoint;
    Point.open = function(time, day) {
      return new OpenPoint(time, day);
    };
    ClosePoint = (function(_super) {

      __extends(ClosePoint, _super);

      function ClosePoint() {
        return ClosePoint.__super__.constructor.apply(this, arguments);
      }

      ClosePoint.prototype.defaultAMPM = 'pm';

      return ClosePoint;

    })(Point);
    Point.Close = ClosePoint;
    Point.close = function(time, day) {
      return new ClosePoint(time, day);
    };
    Day = (function() {
      var setClose, setClosedAllDay, setOpen, setOpenAllDay, setOpenAndClose;

      function Day(params) {
        if (params == null) {
          params = {};
        }
        params = clone(params);
        this.setDayAndName(params.day);
        this.setTimes(params);
      }

      Day.prototype.getOpenRange = function() {
        var args, cm, om;
        args = [this.day];
        if (this.isOpenAllDay) {
          args[1] = 0;
          args[2] = 24;
        } else if (this.isClosedAllDay) {
          args[1] = 0;
          args[2] = -1;
        } else {
          om = this.open.moment();
          cm = this.close.moment();
          args[1] = om.hours();
          args[2] = cm.hours() + 1;
          args[3] = om.minutes();
          args[4] = cm.minutes();
        }
        return rangeOfMoments.apply(null, args);
      };

      Day.prototype.isClosedAllDay = false;

      Day.prototype.isOpenAllDay = false;

      Day.prototype.isOpen = function(now) {
        var _ref, _ref1;
        if (!(now && moment.isMoment(now))) {
          if (now) {
            if (_.isDate(now)) {
              now = moment(now);
            } else if (_.isFinite(+now)) {
              now = moment(+now);
            }
          } else {
            now = moment();
          }
        }
        if (this.isClosedAllDay || (now.day() !== this.day)) {
          return false;
        } else if (this.isOpenAllDay) {
          return true;
        } else {
          return ((_ref = this.open) != null ? typeof _ref.isBefore === "function" ? _ref.isBefore(now) : void 0 : void 0) && ((_ref1 = this.close) != null ? typeof _ref1.isAfter === "function" ? _ref1.isAfter(now) : void 0 : void 0);
        }
      };

      Day.prototype.isClosed = function(now) {
        if (now == null) {
          now = false;
        }
        return !this.isOpen(now);
      };

      Day.prototype.setDayAndName = function(day) {
        day = DayHelper.get(day);
        this.day = day != null ? day.index : void 0;
        this.name = day != null ? day.Name : void 0;
        return this;
      };

      Day.prototype.setTimes = function(params) {
        if ((params.open || params.close) && (params.close !== false && params.open !== false)) {
          setOpenAndClose(this, params);
        } else if (params.close === false) {
          setOpenAllDay(this);
        } else {
          setClosedAllDay(this);
        }
        return this;
      };

      Day.prototype.tomorrow = function() {
        if (this.day === 6) {
          return 0;
        } else {
          return this.day + 1;
        }
      };

      Day.prototype.yesterday = function() {
        if (this.day === 0) {
          return 6;
        } else {
          return this.day - 1;
        }
      };

      Day.prototype.toJSON = function() {
        var params;
        params = {
          day: this.day
        };
        if (this.isOpenAllDay) {
          params.close = false;
        } else if (this.isClosedAllDay) {
          params.open = false;
        } else {
          params.open = this.open.toJSON();
          params.close = this.close.toJSON();
        }
        return params;
      };

      Day.prototype.toString = function() {
        if (this.isOpenAllDay) {
          return "" + this.name + ": Open 24 Hours";
        } else if (this.isClosedAllDay) {
          return "" + this.name + ": Closed";
        } else {
          return "" + this.name + ": " + this.open + " - " + this.close;
        }
      };

      _.extend(Day.prototype, (function() {
        return _(dayNames).reduce(function(functions, name, idx) {
          functions["is" + name] = function() {
            return this.day === idx;
          };
          return functions;
        }, {});
      })());

      Day.factory = function(params, idx) {
        if (!params) {
          params = {
            open: false
          };
        }
        params = clone(params);
        if (!_(params).has('day')) {
          params.day = +idx;
        }
        return new Day(params);
      };

      setOpenAndClose = function(day, params) {
        day.isOpenAllDay = day.isClosedAllDay = false;
        setOpen(day, params.open);
        return setClose(day, params.close);
      };

      setClose = function(day, close) {
        close || (close = "23:59");
        return day.close = Point.close(close, day.day);
      };

      setOpen = function(day, open) {
        open || (open = 0);
        return day.open = Point.open(open, day.day);
      };

      setOpenAllDay = function(day) {
        day.open = day.close = null;
        day.isOpenAllDay = true;
        return day.isClosedAllDay = false;
      };

      setClosedAllDay = function(day) {
        day.open = day.close = null;
        day.isOpenAllDay = false;
        return day.isClosedAllDay = true;
      };

      return Day;

    })();
    Week = (function() {
      var array_defaults, generate_base_days, obj_to_array;

      Week.name = "WeeklySchedule";

      function Week(params) {
        params || (params = generate_base_days());
        this.setDays(params);
      }

      Week.prototype.day = function(needle) {
        return this.getDays()[dh_get(needle, 'Name')];
      };

      Week.prototype.getDays = function() {
        return this.__days;
      };

      Week.prototype.setDays = function(days) {
        var newDays;
        this.__days = {};
        if (_.isArray(days)) {
          newDays = _(array_defaults(days)).map(Day.factory);
          _(dayNames).each(function(dayName) {
            var idx;
            idx = dh_get(dayName, 'index');
            return this[dayName] = newDays[idx];
          }, this.__days);
        } else {
          this.setDays(obj_to_array(days));
        }
        return this;
      };

      Week.prototype.today = function() {
        return this.day(currentDay());
      };

      Week.prototype.isClosed = function(now) {
        return this.today().isClosed(now);
      };

      Week.prototype.isOpen = function(now) {
        var _ref;
        if (now == null) {
          now = false;
        }
        if ((now != null) && moment.isMoment(now)) {
          return (_ref = this.day(now.day())) != null ? _ref.isOpen(now) : void 0;
        } else {
          return this.today().isOpen(now);
        }
      };

      Week.prototype.toJSON = function() {
        return _.invoke(this.getDays(), 'toJSON');
      };

      Week.prototype.toString = function(useHTML) {
        if (useHTML == null) {
          useHTML = false;
        }
        return _(this.getDays()).map(String).join('\n');
      };

      generate_base_days = function() {
        return {
          Sunday: false,
          Monday: false,
          Tuesday: false,
          Wednesday: false,
          Thursday: false,
          Friday: false,
          Saturday: false
        };
      };

      array_defaults = function(array_of_days) {
        if (!_.isArray(array_of_days)) {
          array_of_days = _.toArray(array_of_days);
        }
        return _(0).chain().range(7).map(function(idx) {
          return array_of_days[idx] || {
            open: false
          };
        }).value();
      };

      obj_to_array = function(o) {
        if (o == null) {
          o = {};
        }
        return _(o).reduce(function(indexed_days, values, key) {
          var idx;
          idx = dh_get(key, 'index');
          if (idx != null) {
            indexed_days[idx] = values;
          }
          return indexed_days;
        }, []);
      };

      Week.Day = Day;

      Week.DayHelper = DayHelper;

      Week.Helpers = Helpers;

      Week.Point = Point;

      return Week;

    })();
    if (module != null) {
      module.exports = Week;
    }
    return Week;
  };

  if ((typeof define !== "undefined" && define !== null ? define.amd : void 0) != null) {
    define(factory);
  } else if (typeof module !== "undefined" && module !== null) {
    factory(require, module.exports, module);
  } else {
    this.WeeklySchedule = factory();
  }

}).call(this);
