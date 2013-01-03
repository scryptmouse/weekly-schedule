define(['zepto'], function($) {
  $.fn.json_pp = function(o) {
    var $this = $(this)
      , $code = $this.find('code')
      , s = JSON.stringify(o || {}, null, 2)
    ;

    if ($code.length)
      $code.text(s);
    else
      $this.text(s);

    return this;
  };
});
