/**
 * A simple, performant, and lightweight touch slider powered by HammerJS, jQuery, and CSS3 hardware animations.
 * @param $el
 * @param opts
 * @returns {{init: init, getCurrentSlide: getCurrentSlide, destroy: destroy, getNumSlides: getNumSlides, goToSlide: goToSlide, prev: prev, next: next}}
 * @constructor
 */
var SimpleTouchSlider = function($el, opts){

  var $container = $el.find(" > ul");
  var $slides = $container.find(" > li");

  var slide_width = $slides.first().width();
  var slide_count = $slides.length;

  var current_slide = 0;

  var play_interval_obj;
  var is_animating = false;

  var current_offset = 0;

  var mc; //hammer instance

  //set default opts
  opts = $.extend({
    animation_duration: 400,
    auto_play: true,
    play_interval: 5000,
    onSlideChange: null,
    infinite: true
  }, opts || {});

  //add class namespace
  $el.addClass('sldr');

  //set width and height of container/drawer
  $container.css({
    width: (slide_count * 100) + '%',
    height: $slides.first().height()
  });

  //set width of slide
  $slides.css('width', (100 / slide_count) + '%');

  //set positioning of elements so we can display:none them for performance without them
  //shifting around.
  $slides.each(function(index){

    var $slide = $(this);

    $slide.css('left', (index * slide_width) + 'px');

  });

  //initialize hammer events
  setTimeout(function() {

    //hide slides for performance, but wait so images can start pre-loading
    setTimeout(function() {

      _setDisplayForPerformance(current_slide);

    }, 500);

    mc = new Hammer($el[0]);

    mc.on('swipeleft', _onswipeleft);
    mc.on('swiperight', _onswiperight);
    mc.on('panstart', _onpanstart);

    if (typeof opts.onSlideChange === 'function') {

      opts.onSlideChange(0);

    }

    //auto play
    if (opts.auto_play) {

      play();

    }

  }, 250);

  //on window resize, reposition things
  var debounce_timeout;
  $(window).on('resize.sldr', function(){
    clearTimeout(debounce_timeout);
    debounce_timeout = setTimeout(reposition, 250);
  });

  function _onpanstart() {

    stop();

    mc.on('pancancel panend', _onrelease);
    mc.on('panleft panright', _onpan);

  }

  function _stopListeningToPanEvents() {

    mc.off('pancancel panend');
    mc.off('panleft panright');

  }


  function _onpan(ev) {

    // stick to the finger
    var slide_offeset = -(100/slide_count) * current_slide;
    var drag_offset = ((100/slide_width) * ev.deltaX) / slide_count;

    // slow down at the first and last slide
    if (
      (current_slide === 0 && ev.direction === Hammer.DIRECTION_RIGHT && ev.deltaX > 0) ||
      (current_slide === slide_count - 1 && ev.direction === Hammer.DIRECTION_LEFT) && ev.deltaX < 0)
    {

      drag_offset *= .4;

    }

    _setContainerOffset(drag_offset + slide_offeset);

  }

  function _onrelease() {

    _stopListeningToPanEvents();

    //ignore if we're currently animating
    if (is_animating) {

      return;

    }

    //figure out where we should go. if we're less than 50% offset from current slide in
    //either direction, then just animate to current slide. otherwise, go prev or next.

    var offset_current_slide = _getOffsetForSlide(current_slide);
    var offset_prev_slide = current_slide > 0 ? _getOffsetForSlide(current_slide - 1) : null;
    var offset_next_slide = current_slide < slide_count - 1 ? _getOffsetForSlide(current_slide + 1) : null;
    var offset_slide_difference = offset_prev_slide !== null ? Math.abs(offset_prev_slide - offset_current_slide) :
      Math.abs(offset_next_slide - offset_current_slide);
    var offset_delta = offset_current_slide - current_offset;

    if (offset_next_slide !== null && offset_delta / offset_slide_difference > 0.5) {

      next();

    } else if (offset_prev_slide !== null && offset_delta / offset_slide_difference < -0.5) {

      prev();

    } else {

      _animateToSlide(current_slide);

    }

  }

  function _onswipeleft() {

    stop();

    _stopListeningToPanEvents();

    if (is_animating) {

      return;

    }

    //don't allow infinite
    if (current_slide === slide_count - 1) {

      _animateToSlide(current_slide);

      return;

    }

    next();

  }

  function _onswiperight() {

    stop();

    _stopListeningToPanEvents();

    if (is_animating) {

      return;

    }

    //don't allow infinite
    if (current_slide === 0) {

      _animateToSlide(current_slide);

      return;

    }

    prev();

  }

  /**
   * show slide by index
   */
  function _animateToSlide(index) {

    _setDisplayForPerformance(index);

    // between the bounds
    index = Math.max(0, Math.min(index, slide_count-1));
    current_slide = index;

    var offset = _getOffsetForSlide(current_slide);

    _setContainerOffset(offset, true);

    if (opts.onSlideChange) {

      opts.onSlideChange(index);

    }

  }

  function _getOffsetForSlide(index) {

    return -( ( 100 / slide_count) * index );

  }

  /**
   * @param offset
   * @param animate
   */
  function _setContainerOffset(offset, animate) {

    current_offset = offset;

    if (animate && is_animating) {

      $container.css("transform", "translate3d(" + offset + "%,0,0) scale3d(1,1,1)");

    } else if (animate) {

      $container.addClass("animate");
      is_animating = true;
      setTimeout(function(){

        $container.css("transform", "translate3d(" + offset + "%,0,0) scale3d(1,1,1)");

      }, 0);

    } else {

      $container.removeClass("animate");
      is_animating = false;
      $container.css("transform", "translate3d(" + offset + "%,0,0) scale3d(1,1,1)");

    }
  }

  function _setDisplayForPerformance(index) {

    //at any given time, only the current, previous, and next slides should have display:
    // inline-block. the rest should be none.

    var $current = $slides.eq(index);
    var $next = $slides.eq(index + 1);
    var $prev = $slides.eq(index - 1);

    $slides.css('display', 'none');
    $prev.css('display', 'block');
    $current.css('display', 'block');
    $next.css('display', 'block');

  }

  function next() {

    stop();

    if (current_slide === slide_count - 1 && opts.infinite) {

      current_slide = -1

    }

    return _animateToSlide(current_slide + 1);

  }

  function prev() {

    stop();

    if (current_slide === 0 && opts.infinite) {

      current_slide = slide_count

    }

    return _animateToSlide(current_slide - 1);
  }

  function play() {

    stop();
    play_interval_obj = setInterval(function(){

      if (current_slide === slide_count - 1 && opts.infinite) {

        current_slide = -1

      }

      _animateToSlide(current_slide + 1);

    }, opts.play_interval);

  }

  function stop() {

    clearTimeout(play_interval_obj);

  }

  /**
   * @param index
   */
  function goToSlide(index) {

    stop();
    _animateToSlide(index);

  }

  function reposition(){

    //get new slide width
    slide_width = $slides.first().width();

    //resize container
    $container.css({
      height: $slides.first().height()
    });

    //reposition slides
    $slides.each(function(index){

      var $slide = $(this);

      $slide.css('left', (index * slide_width) + 'px');

    });

  }

  /**
   * Tear down function to kill intervals and unbind listeners.
   */
  function destroy() {

    stop();
    mc.destroy();
    $(window).off('resize.sldr');

  }

  return {
    getCurrentSlide: function(){ return current_slide; },
    destroy: destroy,
    getNumSlides: function(){ return slide_count; },
    goToSlide: goToSlide,
    prev: prev,
    next: next,
    play: play,
    stop: stop,
    reposition: reposition
  };
};
