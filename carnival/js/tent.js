"use strict";
var app = app || {};

// using:
// http://www.turbosquid.com/3d-models/tent-max-free/660727
app.Tent = {

	object: undefined,
	meshes: [],

	pizzaObject: undefined,
	pizzaMesh: undefined,

	load: function(texURL, meshURL)
	{
		var manager = new THREE.LoadingManager();
		manager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
		};

		var loader = new THREE.OBJLoader( manager );
		loader.load( meshURL, function ( object ) {

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh ) {
					child.material = new THREE.MeshPhongMaterial({color: 0xA89441});
					app.Tent.meshes.push(child);
				}
			} );

			object.rotation.x= -Math.PI/2;
			object.rotation.z= -Math.PI/4;
			object.position.y = -18;
			object.position.x = 200;
			object.position.z = -500;
			app.Tent.object = object;

			app.carnival.scene.add(app.Tent.object);
		} );

		this.makeTables();

	}, // end function

	loadPizza: function(texURL, meshURL)
	{
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

		var loader = new THREE.OBJLoader( manager );
		loader.load( meshURL, function ( object ) {

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh ) {
					child.material.map = texture;
					app.Tent.pizzaMesh = child;
				}
			} );

			object.rotation.x= Math.PI/2;
			object.rotation.y= -Math.PI;
			object.position.z = 36;
			object.position.x = 40;

			app.Tent.pizzaObject = object;
			app.Tent.object.add(app.Tent.pizzaObject);
		} );
	},

	makeTables: function()
	{
		// set up some tables
		var geo = new THREE.CubeGeometry(30, 60, 5);
		var mat = new THREE.MeshPhongMaterial({color: 0xffffff});
		var table1 = new THREE.Mesh(geo, mat);
		var table2 = new THREE.Mesh(geo, mat);

		table1.position.y = 15;
		table1.position.x = 210;
		table1.position.z = -450;
		table1.rotation.x= -Math.PI/2;
		table1.rotation.z= -Math.PI/4;

		table2.position.y = 15;
		table2.position.x = 125;
		table2.position.z = -560;
		table2.rotation.x= -Math.PI/2;
		table2.rotation.z= -Math.PI/4;

		app.carnival.scene.add(table1);
		app.carnival.scene.add(table2);

		var legGeo = new THREE.CubeGeometry(5, 5, 50);
		var legs = [];

		for(var i=0; i<4; i++)
		{
			legs[i] = new THREE.Mesh(legGeo, mat);
			legs[i].position.z = -25;
			table1.add(legs[i]);
		}

		var xOffset = 10;
		var yOffset = 20;

		legs[0].position.x += xOffset;
		legs[0].position.y += yOffset;

		legs[1].position.x -= xOffset;
		legs[1].position.y -= yOffset;

		legs[2].position.x -= xOffset;
		legs[2].position.y += yOffset;

		legs[3].position.x += xOffset;
		legs[3].position.y -= yOffset;

		for(var i=4; i<8; i++)
		{
			legs[i] = new THREE.Mesh(legGeo, mat);
			legs[i].position.z = -25;
			table2.add(legs[i]);
		}

		legs[4].position.x += xOffset;
		legs[4].position.y += yOffset;

		legs[5].position.x -= xOffset;
		legs[5].position.y -= yOffset;

		legs[6].position.x -= xOffset;
		legs[6].position.y += yOffset;

		legs[7].position.x += xOffset;
		legs[7].position.y -= yOffset;

	}

/*
	update: function()
	{
		if(this.mesh)
		{
			this.mesh.position.x++;
		}

	}
	*/

};
