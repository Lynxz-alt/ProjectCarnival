"use strict";
var app = app || {};

app.GameStand = {

	object: undefined,
	mesh: undefined,

	active: undefined,
	camera: undefined,

	ball: undefined,
	isBallActive: false,
	ballDestination: undefined,
	gravityAccel: 0,

	items: [],
	rows: 2,
	cols: 6,

	load: function(texURL, meshURL)
	{
		// texture
		var manager = new THREE.LoadingManager();
		manager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
		};

		var texture = new THREE.Texture();

		var loader = new THREE.ImageLoader( manager );
		loader.load( texURL, function ( image ) {

			texture.image = image;
			texture.needsUpdate = true;

		} );

		// model
		var loader = new THREE.OBJLoader( manager );
		loader.load( meshURL, function ( object ) {

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh ) {
					child.material.map = texture;
					app.GameStand.mesh = child;
				}

			} );

			//object.material.map = texture;
			object.rotation.y= Math.PI;
			object.position.y = 35;
			object.position.x = -500;
			object.position.z = -500;
			object.scale.set(20, 20, 20);
			app.GameStand.object = object;

			app.carnival.scene.add(app.GameStand.object);
		} );

		// init other parts of the game stand
		this.initBall();
		this.initItems();

	}, // end function

	// gets called from app.carnival
	initCamera: function(fov, aspect, near, far ){
		//create camera
		this.camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
		this.controls = new THREE.FirstPersonControls(this.camera);
		this.controls.movementSpeed = 0;
		this.controls.lookSpeed = 0.18;
		this.controls.autoForward = false;

		this.camera.position.y = 35;
		this.camera.position.x = -500;
		this.camera.position.z = -400;
	},

	initBall: function(){
		// load the ball and hide it
		var ballGeo = new THREE.SphereGeometry( 5, 32, 32 );
		var ballMat = new THREE.MeshPhongMaterial({color: 0xff0000, overdraw: true});
		this.ball = new THREE.Mesh(ballGeo, ballMat);
		this.ball.position.y = 30;
		this.ball.position.x = -480;
		this.ball.position.z = -450;
		this.ball.material.transparent = true;
		this.ball.material.opacity = 0.0;
		app.carnival.scene.add(this.ball);
	},

	initItems: function(){
		// load eggplants and caramels on the shelves
		for(var i=0; i<this.rows; i++)
		{
			for(var j=0; j<this.cols; j++)
			{
				// randomize whether it's an eggplant or caramel
				var rand = app.utilities.getRandom(0, 1);

				var itemGeo;
				var itemMat;

				if(rand > 0.5)
				{
					// Caramel
					itemGeo = new THREE.CubeGeometry(6, 10, 5);
					itemMat = new THREE.MeshPhongMaterial({color: 0xFFDB66, overdraw: true});

				} else {
					// Eggplant
					itemGeo = new THREE.SphereGeometry( 5, 32, 32 );
					itemMat = new THREE.MeshPhongMaterial({color: 0xaa00ff, overdraw: true});
				}

				var itemMesh = new THREE.Mesh(itemGeo, itemMat);

				itemMesh.position.y = 46 - 18 * i;
				itemMesh.position.x = -538 + 15 * j;
				itemMesh.position.z = -510;

				this.items.push(itemMesh);
				app.carnival.scene.add(itemMesh);
			}
		}
	},

	doRaycast: function(raycaster) {

		// an array of objects we are checking for intersections
		// you’ll need to put your own objects here
		var array = this.items;
		array.push(this.mesh);
		var intersects = raycaster.intersectObjects(array);

		if (intersects.length > 0) {
			// Player clicked on game stand
			if(intersects[0].object == this.mesh)
			{
				// Begin game
				if(!this.active)
				{
					this.active = true;
					app.ferrisWheel.active = false;
					this.ball.material.opacity = 1.0;
				}
			}
			// Player clicked on an item
			else if(this.active)
			{
				// Set destination and toss ball
				this.ballDestination = new THREE.Vector3();
				this.ballDestination.x = intersects[0].object.position.x;
				this.ballDestination.y = intersects[0].object.position.y + 50;
				this.ballDestination.z = intersects[0].object.position.z;
				this.tossBall();
			}
		}
		// Player clicks away from active game
		else if(this.active)
		{
			this.active = false;
			this.ball.material.opacity = 0.0;
		}
	},

	tossBall: function()
	{
		if(!this.isBallActive)
		{
			// Set the ball to start going
			this.isBallActive = true;
			createjs.Sound.play("whoosh", {loop:0, volume:1.0});
		}
	},

	update: function()
	{
		// If ball is in action, update its motion
		if(this.isBallActive)
		{
			// move towards destination
			this.ball.position.x += (this.ballDestination.x - this.ball.position.x)/50;
			this.ball.position.y += (this.ballDestination.y - this.ball.position.y)/50;
			this.ball.position.z += (this.ballDestination.z - this.ball.position.z)/50;

			// really hacky gravity
			this.ball.position.y -= this.gravityAccel;
			this.gravityAccel += 0.05;

			if(this.ball.position.y < 0)
			{
				this.isBallActive = false;
				this.gravityAccel = 0;
				this.ball.position.y = 30;
				this.ball.position.x = -480;
				this.ball.position.z = -450;
			}
		}
	}

};
