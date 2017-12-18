/**
 * A simple touch slider jQuery plugin, powered by HammerJS.
 * @param $el
 * @param opts
 * @returns {{init: init, getCurrentSlide: getCurrentSlide, destroy: destroy, getNumSlides: getNumSlides, goToSlide: goToSlide, prev: prev, next: next}}
 * @constructor
 */
var SimpleTouchSlider = function($el, opts){

  var $container = $el.find(" > ul");
  var $panes = $container.find(" > li");

  var pane_width = 0;
  var pane_count = $panes.length;

  var current_pane = 0;

  var play_interval_obj;
  var is_animating = false;

  var mc; //hammer instance


  /**
   * initial
   */
  function init() {

    //set width of container
    $container.css('width', (pane_count * 100) + '%');

    $panes.css('width', (100 / pane_count) + '%');

    setTimeout(function() {

      mc = new Hammer($el);

      mc.on('pancancel panend', onrelease);
      mc.on('panleft panright', onpan);
      mc.on('swipeleft', onswipeleft);
      mc.on('swiperight', onswiperight);

      //on page change is called on init
      if (typeof opts.onPageChange === 'function') {

        opts.onPageChange(0);

      }

      //auto play
      if (opts.auto_play) {

        play();

      }

    }, 500);
  }

  function onpan(ev) {

    stop();

    if (!pane_width) {

      pane_width = $panes.first().width();

    }

    // stick to the finger
    var pane_offset = -(100/pane_count) * current_pane;
    var drag_offset = ((100/pane_width) * ev.deltaX) / pane_count;

    // slow down at the first and last pane
    if ((current_pane === 0 && ev.direction === "right") ||
      (current_pane === pane_count-1 && ev.direction === "left")) {

      drag_offset *= .4;

    }

    setContainerOffset(drag_offset + pane_offset);

  }

  function onrelease(ev) {

    if (!pane_width) {

      pane_width = $panes.first().width();

    }

    // more then 50% moved, navigate
    if (Math.abs(ev.deltaX) > pane_width / 2) {

      if(ev.direction === 'right') {

        prev();

      } else {

        next();

      }

    } else {

      showPane(current_pane, true);

    }

  }

  function onswipeleft() {

    stop();
    next();

  }

  function onswiperight() {

    stop();
    prev();

  }

  /**
   * show pane by index
   */
  function showPane(index, animate) {

    // between the bounds
    index = Math.max(0, Math.min(index, pane_count-1));
    current_pane = index;

    var offset = -((100/pane_count)*current_pane);

    setContainerOffset(offset, animate);

    if (opts.onPageChange) {

      opts.onPageChange(index);

    }

  }

  /**
   * @param percent
   * @param animate
   */
  function setContainerOffset(percent, animate) {

    if (animate && is_animating) {

      $container.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");

    } else if (animate) {

      $container.addClass("animate");
      is_animating = true;
      setTimeout(function(){

        $container.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");

      }, 0);

    } else {

      $container.removeClass("animate");
      is_animating = false;
      $container.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");

    }
  }

  /**
   * @param infinite
   */
  function next(infinite) {

    if (current_pane === pane_count - 1 && infinite) {

      current_pane = -1

    }

    return showPane(current_pane+1, true);

  }

  /**
   * @param infinite
   */
  function prev(infinite) {

    if (current_pane === 0 && infinite) {

      current_pane = pane_count

    }

    return showPane(current_pane-1, true);
  }

  function play() {

    play_interval_obj = setInterval(next, opts.play_interval);

  }

  function stop() {

    clearTimeout(play_interval_obj);

  }

  /**
   * @param index
   */
  function goToSlide(index) {

    showPane(index, true);

  }

  /**
   * Tear down function to kill intervals and unbind listeners.
   */
  function destroy() {

    mc.destroy();
    clearInterval(play_interval_obj);

  }

  return {
    init: init,
    getCurrentSlide: function(){ return current_pane; },
    destroy: destroy,
    getNumSlides: function(){ return pane_count; },
    goToSlide: goToSlide,
    prev: prev,
    next: next
  };
};


/* JQUERY PLUGIN */

(function($) {

  $.fn.SimpleTouchSlider = function(opts) {

    var $this = $(this);

    opts = $.extend({
      el: $this,
      animation_duration: 400,
      auto_play: true,
      play_interval: 5000,
      onPageChange: null
    }, opts);

    var s = new SimpleTouchSlider($this, opts);

    s.init();
    $this.data('sldr', s).addClass('sldr');

    return s;

  };

})(jQuery);
