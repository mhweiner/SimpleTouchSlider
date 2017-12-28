# SimpleTouchSlider
A simple touch slider powered by HammerJS, jQuery, and CSS3 hardware animations.

## Dependencies

* jQuery 1.6+
* HammerJS 2.0.0+ (http://hammerjs.github.io/)

If anyone wants to submit a pull request to convert to a jQuery-free, vanilla JS version, that would be awesome. I just don't have the time right now... PR's welcome!

## Usage

HTML:

```HTML
<div class="sldr">
  <ul>
    <li>Slide 1</li>
    <li>Slide 2</li>
    <li>Slide 3</li>
  </ul>
</div>
```

CSS:

```CSS
.sldr {
    overflow: hidden;
    width: 100%;
    -webkit-transform: translate3d(0,0,0) scale3d(1,1,1);
    -webkit-transform-style: preserve-3d;
    cursor: auto;
    ul{
      transform: translate3d(0,0,0) scale3d(1,1,1);
      -webkit-transform: translate3d(0,0,0) scale3d(1,1,1);
      overflow: hidden;
      -webkit-transform-style: preserve-3d;
      position: relative;
      height: 100%;
      margin: 0;
      padding: 0;
      li {
        display: inline-block;
        -webkit-transform-style: preserve-3d;
        -webkit-transform: translate3d(0,0,0);
        width: 100%;
        padding: 0;
        position: relative;
        text-align: center; //this and the next few lines are for example. you don't need them.
        color: white;
        font-size: 200px;
        line-height: 100%;
      }
      &.animate{
        transition: all .5s;
      }
    }
  }
```

Javascript:

```js
//without options
var sldr = new SimpleTouchSlider($('.sldr'));

//with options
var sldr = new SimpleTouchSlider($('.sldr'), {
  infinite: false,
  auto_play: false,
  onSlideChange: function(index) {
    console.log('Slide ' + (index + 1) + ' is showing!');
  }
});
```

## Options

* animation_duration (Default: 400) (in milliseconds)
* auto_play (Default: true)
* play_interval (Default: 5000) (in milliseconds)
* onSlideChange (Default: null) Callback.
* infinite (Default: true)

## API

### getCurrentSlide()

Returns current slide position (integer).

### destroy()

Destroys the instance, stops playing, and frees up memory.

### getNumSides()

Returns the number of slides (integer).

### goToSlide(index)

Animates to the specified slide.

### prev()

Animates to the previous slide.

### next()

Animates to the next slide().

### play()

Starts/resumes playing.

### stop()

Stops playing.
