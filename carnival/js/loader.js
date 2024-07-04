/*
loader.js
variable app is in global scope - i.e. a property of window.
app is our single global object literal - all other functions and properties of
the bubbles game will be properties of app.
*/
"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

// CONSTANTS of app
app.KEYBOARD = {
  KEY_LEFT: 37,
  KEY_UP: 38,
  KEY_RIGHT: 39,
  KEY_DOWN: 40,
  KEY_SPACE: 32,
};

// properties of app
app.animationID = undefined;
app.paused = false;

// key daemon array
app.keydown = [];

(function () {
  var queue = new createjs.LoadQueue(false);
  queue.on("fileload", handleFileLoad, this);
  queue.on("complete", complete, this);

  // libraries
  queue.loadFile("js/lib/three.min.js");
  queue.loadFile("js/lib/FirstPersonControls.js");
  queue.loadFile("js/lib/FreeRoom.js")
  queue.loadFile("js/lib/Cinematography.js");
  queue.loadFile("js/lib/OBJLoader.js");
  queue.loadFile("js/lib/jquery-1.9.0.js");
  queue.loadFile("js/lib/tween.js");
  queue.loadFile("js/lib/stats.js");

  // function constructor classes
  queue.loadFile("js/avatar.js");
  queue.loadFile("js/tree.js");

  // object literal classes
  queue.loadFile("js/foodStand.js");
  queue.loadFile("js/gameStand.js");
  queue.loadFile("js/backgroundTents.js");
  queue.loadFile("js/tent.js");
  queue.loadFile("js/skytween.js");
  queue.loadFile("js/ferrisWheel.js");

  // main class and utilities
  queue.loadFile("js/carnival.js");
  queue.loadFile("js/utilities.js");

  function handleFileLoad(e) {
    //console.log(e + " loaded");
  }

  function handleComplete(e) {
    app.carnival.init();
  }

  function initStats() {
    var stats = new Stats();

    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = "absolute";
    stats.domElement.style.left = "0px";
    stats.domElement.style.top = "0px";

    $("#Stats-output").append(stats.domElement);

    return stats;
  }

  // when the loading is complete, this function will be called
  function complete() {
    var SCREEN_WIDTH = window.innerWidth,
      SCREEN_HEIGHT = window.innerHeight;
    var FOV = 45,
      ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
      NEAR = 0.1,
      FAR = 5000;
    app.stats = initStats();

    // set up event handlers
    window.onblur = function () {
      app.paused = true;
      cancelAnimationFrame(app.animationID);
      app.keydown = []; // clear key daemon
      createjs.Sound.stop(); // stop music
      // call update() so that our paused screen gets drawn
      app.carnival.update();
    };

    window.onfocus = function () {
      app.paused = false;
      cancelAnimationFrame(app.animationID);
      app.carnival.startSoundtrack(); // start soundtrack
      // start the animation back up
      app.carnival.update();
    };

    // event listeners
    window.addEventListener("keydown", function (e) {
      e.preventDefault();
      console.log("keydown=" + e.keyCode);
      app.keydown[e.keyCode] = true;
    });

    window.addEventListener("keyup", function (e) {
      e.preventDefault();
      //console.log("keyup=" + e.keyCode);
      app.keydown[e.keyCode] = false;
    });

    //resizes game
    window.addEventListener("resize", function (e) {
      app.carnival.renderer.setSize(window.innerWidth, window.innerHeight);
      // update the camera
      app.carnival.camera.aspect = window.innerWidth / window.innerHeight;
      app.carnival.camera.updateProjectionMatrix();

      app.ferrisWheel.camera.aspect = window.innerWidth / window.innerHeight;
      app.ferrisWheel.camera.updateProjectionMatrix();

      app.GameStand.camera.aspect = window.innerWidth / window.innerHeight;
      app.GameStand.camera.updateProjectionMatrix();

      app.carnival.controls.handleResize();
      app.ferrisWheel.controls.handleResize();
    });

    document.addEventListener(
      "mousedown",
      function (e) {
        app.carnival.doRaycast(e);
      },
      false,
    );

    // load sounds with soundjs
    createjs.Sound.alternateExtensions = ["mp3"];
    createjs.Sound.registerSound({id: "soundtrack", src: "sounds/bgmusic.ogg"}); // incompetech.com
    createjs.Sound.registerSound({id: "whoosh", src: "sounds/whoosh.ogg"}); // soundbible.com

    createjs.Sound.addEventListener("fileload", handleFileLoad);
    function handleFileLoad(e) {
      console.log("Preloaded Sound", e.id, e.src);
      if (e.id == "soundtrack") app.carnival.startSoundtrack();
    }

    // start game
    app.carnival.init(FOV, SCREEN_HEIGHT, SCREEN_WIDTH, ASPECT, NEAR, FAR);
  } // end complete
})();
