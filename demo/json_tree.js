define(['zepto', 'underscore', 'bootstrap'], function($, _) {

  var MAX_RECURSIONS = 5
    , _toString = ({}).toString
    , _typeOfRgx = /\[object (\w+)\]/
  ;

  function typeOf() {
    return _toString.call(arguments[0]).replace(_typeOfRgx, '$1');
  }

  function isArray(thing) {
    return typeOf(thing) === 'Array';
  }

  function property(s) {
    return '<strong class="json-property">'+s+'</strong>';
  }

  function primitive(s) {
    var $code = $('<em />');

    if (_.isNumber(s))
      $code.addClass('json-number').text(s);
    else if (_.isBoolean(s))
      $code.addClass('json-boolean').text(s);
    else if (_.isNull(s))
      $code.addClass('json-null').text(s);
    else
      $code.addClass('json-string').text('"'+s+'"');

    return $code.asHtml();
  }

  function collectionText(coll, isHeader) {
    isHeader = !!isHeader;
    if (isArray(coll)) {
      return '<span class="json-collection json-array">'+(isHeader ? '[ Array ]' : '[]')+'</span>';
    } else {
      return '<span class="json-collection json-object">'+(isHeader ? '{ Object } ' : '{}')+'</span>';
    }
  }

  function getToken() {
    return Math.random().toString(36).substr(2,16);
  }

  function json_tree(o, recursions) {
    var $ul = $('<ul class="json-tree"></ul>');
    var contents = '';
    var token;

    recursions = recursions || 0;

    if (recursions === 0) {
      token = getToken();
      $ul.addClass('unstyled');
      contents += '<li>';
      contents += '<a href="#'+token+'" data-toggle="collapse" class="json-tree-header label label-success">'+collectionText(o, true)+':</a>';
      contents += '<div id="'+token+'" class="in collapse">'+json_tree(o, ++recursions)+'</div>';
      contents += '</li>';
    } else {
      _(o).each(function(value, prop) {
        if (_.isFunction(value) || _.isUndefined(value))
          return;

        if (_.isObject(value) || _.isArray(value)) {
          token = getToken();
          contents += '<li>';
          contents += '<a href="#'+token+'" data-toggle="collapse" class="badge badge-info collapsed">'+collectionText(value)+'</a>';
          contents += ' '+property(prop)+': ';
          contents += '<div id="'+token+'" class="collapse">'+json_tree(value, ++recursions)+'</div>';
          contents += '</li>';
        } else {
          contents += '<li>'+property(prop)+' : '+primitive(value)+'</li>';
        }
      });
    }

    $ul.append(contents);

    return $ul.asHtml();
  }

  $.fn.asHtml = function() {
    var $container = $('<div />').append($(this).clone());

    return $container.html();
  };

  $.fn.json_tree = function(o) {
    $(this).html(json_tree(o || {}));

    return this;
  };
});
