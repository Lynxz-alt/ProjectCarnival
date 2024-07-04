"use strict";

var app = app || {};

app.skytween = {

  current: undefined,
  intervalTime: 20000,
  tweens: [],
  colors: [],

  init : function()
  {
    // init colors (add any you need here)
    this.colors.push(new THREE.Color(0x00aaff)); // blue
    this.colors.push(new THREE.Color(0x001144)); // darker blue
    this.colors.push(new THREE.Color(0x000000)); // black

    // the interpolating color
    this.current = {r: this.colors[0].r, g: this.colors[0].g, b:this.colors[0].b };

    // init tweens for color interpolation
    for(var i=0; i<this.colors.length; i++)
    {
      var rgbColor = {r: this.colors[i].r, g:this.colors[i].g, b:this.colors[i].b};
      var tween = new TWEEN.Tween(this.current).to(rgbColor, this.intervalTime);
      this.tweens.push(tween);

      this.tweens[i].onUpdate(this.doTweenUpdate);

      if(i>0)
        this.tweens[i-1].chain(this.tweens[i]);
    }

    this.tweens[this.colors.length-1].chain(this.tweens[0]);
    this.tweens[0].start();
  },

  doTweenUpdate : function()
  {
    if(!app.pause)
	{
		var c = app.skytween.current;
		//console.log(c);
		var color = new THREE.Color(c.r, c.g, c.b);
		app.carnival.renderer.setClearColor(color, 1);
	}
  },

  // Apply appropriate light intensity to a natural light source
  getSunLightIntensity : function()
  {
    // RGB to Luminescence formula: Y = 0.2126 R + 0.7152 G + 0.0722 B
    var rl = app.skytween.current.r * 0.2126;
    var gl = app.skytween.current.g * 0.7152;
    var bl = app.skytween.current.b * 0.0722;

    var intensity = rl + gl + bl;
    return intensity;
  }
};
