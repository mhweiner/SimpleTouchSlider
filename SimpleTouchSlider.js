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

  var mc; //hammer instance

  //set default opts
  opts = $.extend({
    animation_duration: 400,
    auto_play: false,
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

    mc.on('pancancel panend', _onrelease);
    mc.on('panleft panright', onpan);
    mc.on('swipeleft', _onswipeleft);
    mc.on('swiperight', _onswiperight);

    //on page change is called on init
    if (typeof opts.onSlideChange === 'function') {

      opts.onSlideChange(0);

    }

    //auto play
    if (opts.auto_play) {

      play();

    }

  }, 500);

  //on window resize, reposition things
  $(window).on('resize.sldr', reposition);


  function onpan(ev) {

    stop();

    // stick to the finger
    var slide_offeset = -(100/slide_count) * current_slide;
    var drag_offset = ((100/slide_width) * ev.deltaX) / slide_count;

    // slow down at the first and last slide
    if ((current_slide === 0 && ev.direction === "right") ||
      (current_slide === slide_count-1 && ev.direction === "left")) {

      drag_offset *= .4;

    }

    _setContainerOffset(drag_offset + slide_offeset);

  }

  function _onrelease(ev) {

    // more then 50% moved, navigate
    if (Math.abs(ev.deltaX) > slide_width / 2) {

      if(ev.direction === 'right') {

        prev();

      } else {

        next();

      }

    } else {

      _showSlide(current_slide, true);

    }

  }

  function _onswipeleft() {

    stop();
    next();

  }

  function _onswiperight() {

    stop();
    prev();

  }

  /**
   * show slide by index
   */
  function _showSlide(index, animate) {

    _setDisplayForPerformance(index);

    // between the bounds
    index = Math.max(0, Math.min(index, slide_count-1));
    current_slide = index;

    var offset = -((100/slide_count)*current_slide);

    _setContainerOffset(offset, animate);

    if (opts.onSlideChange) {

      opts.onSlideChange(index);

    }

  }

  /**
   * @param percent
   * @param animate
   */
  function _setContainerOffset(percent, animate) {

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

  function _setDisplayForPerformance(index) {

    //at any given time, only the current, previous, and next slides should have display:
    // inline-block. the rest should be none.

    var $current = $slides.eq(index);
    var $next = $slides.eq(index + 1);
    var $prev = $slides.eq(index - 1);

    $slides.css('display', 'none');
    $prev.css('display', 'inline-block');
    $current.css('display', 'inline-block');
    $next.css('display', 'inline-block');

  }

  function next() {

    stop();

    if (current_slide === slide_count - 1 && opts.infinite) {

      current_slide = -1

    }

    return _showSlide(current_slide + 1, true);

  }

  function prev() {

    stop();

    if (current_slide === 0 && opts.infinite) {

      current_slide = slide_count

    }

    return _showSlide(current_slide - 1, true);
  }

  function play() {

    stop();
    play_interval_obj = setInterval(function(){

      if (current_slide === slide_count - 1 && opts.infinite) {

        current_slide = -1

      }

      _showSlide(current_slide + 1, true);

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
    _showSlide(index, true);

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
