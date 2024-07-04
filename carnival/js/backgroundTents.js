"use strict";
var app = app || {};

// using:
// http://www.turbosquid.com/3d-models/tent-max-free/660727
app.BackgroundTents = {

    zpos: -900,

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
					child.material = new THREE.MeshPhongMaterial({color: 0xffffff});
				}
			} );

			object.rotation.x= -Math.PI/2;
			//object.rotation.z= -Math.PI/2;
			object.position.y = -18;
			object.position.x = 600;
			object.position.z = app.BackgroundTents.zpos;
			
			app.BackgroundTents.zpos += 800;
			app.carnival.scene.add(object);
			
		} );

	}, // end function

};
