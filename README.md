# RayJS

A JS Canvas manager, it features some more comprehensive errors and contains pieces of code that you keep copy-pasting from [MDN][copy-pasta-exampla].

## Setup

Add the RayJS script to your webpage:

```html
<head>
  <!-- We omitted the other (probably copy-pasted) stuff that you'd put in your <head> -->
  <script src="https://creativewolfies.github.io/RayJS/RayJS.js"></script>
</head>
```

Once this is done, you can then implement the library. It contains one class, named `RayJS`.

Let this be a small example script:

```html
<!DOCTYPE html>
<html lang="en" dir="ltr"> <!-- totally not generated with atom's snippets -->
  <head>
    <meta charset="utf-8"> <!-- never forget 'em metas -->
    <title>A small example script</title>
    <script src="https://creativewolfies.github.io/RayJS/RayJS.js"></script>
    <script>
var scene = new RayJS();

window.onload = function() {
  scene.init(true); // setting the first argument (fullscreen) to true will create a new element for us
  scene.setDrawingMethod(draw);
  scene.startLooping();
  scene.switchAutoResize(true); // so that the canvas resizes as we change the window's dimensions
}

function draw() {
  scene.clearCanvas();
  scene.setFillColor("#a3c4d9"); // kinda blue
  scene.usePenRect(10, 10, 100, 100);
  scene.fill();
}
    </script>
  </head>
  <body>
    <!-- Nothing ^w^ -->
  </body>
</html>
```

[copy-pasta-exampla]: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled#Using_the_globalAlpha_property "CanvasRenderingContext2D.imageSmoothingEnabled (I copy-pasted this link)"
