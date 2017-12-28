# SimpleTouchSlider
Simple touch slider library, powered by HammerJS

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

```CSS
.sldr {
}
```

Javascript:

```js
//with default settings
var sldr = new SimpleTouchSlider($('.sldr'));

//override some defaults
var sldr = new SimpleTouchSlider($('.sldr'), {
  infinite: false,
  auto_play: false,
  onSlideChange: function(index) {
    console.log('Slide ' + (index + 1) + ' is showing!');
  }
});
```

### API

