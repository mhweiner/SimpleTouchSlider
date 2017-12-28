# SimpleTouchSlider
Simple touch slider library, powered by HammerJS

## Usage

```js
//with default settings
var sldr = new SimpleTouchSlider($('.sldr'));

//override some defaults
var sldr = new SimpleTouchSlider($('.sldr'), {
  infinite: false,
  auto_play: false,
  onSlideChange: function(index) {
    console.log('Slide (index + 1) + ' is showing!');
  }
});
```

