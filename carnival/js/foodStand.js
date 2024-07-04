"use strict";
var app = app || {};

// using:
// https://cdn.tutsplus.com/psd/uploads/legacy/0495_Wood_Textures/03-free-wood-textures.jpg
//
app.FoodStand = {

	object: undefined,
	mesh: undefined,
	
	foodObject: undefined,
	foodObjectActive: false,
	foodObjectBob: 1,

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
					app.FoodStand.mesh = child;
				}

			} );

			object.position.y = 15;
			object.position.x = -300;
			object.position.z = -500;
			object.scale.set(20, 20, 20);
			app.FoodStand.object = object;

			app.carnival.scene.add(app.FoodStand.object);
			
			// once the stand is done loading, load extras
			app.FoodStand.makeFoodItems();
		} );
		
	}, // end function
	
	makeFoodItems: function()
	{
	    var stickGeo = new THREE.CylinderGeometry(0.5, 0.5, 6);
	    var stickMat = new THREE.MeshPhongMaterial({color: 0xBB8F00});
	    var stick = new THREE.Mesh(stickGeo, stickMat);
	
	    stick.position.x = this.object.position.x + 10;
	    stick.position.y = this.object.position.y + 10;
	    stick.position.z = this.object.position.z + 30;
	    
	    var cornDogMat = new THREE.MeshPhongMaterial({color: 0xBA7600});
	    
	    
	    var cylinderGeo = new THREE.CylinderGeometry(2, 2, 5);
	    var cylinder = new THREE.Mesh(cylinderGeo, cornDogMat);
	    
	    
	    var sphereGeo = new THREE.SphereGeometry(2);
	    var sphere1 = new THREE.Mesh(sphereGeo, cornDogMat);
	    var sphere2 = new THREE.Mesh(sphereGeo, cornDogMat);
	    
	    cylinder.add(sphere1);
	    cylinder.add(sphere2);
	    
	    sphere1.position.y= cylinder.geometry.height/2;
	    sphere2.position.y= -cylinder.geometry.height/2;
	    
	    stick.add(cylinder);
	    cylinder.position.y = 7;
	    
	    this.foodObject = stick;
	    
	    /*
	    this.foodMeshes.push(stick);
	    this.foodMeshes.push(sphere1);
	    this.foodMeshes.push(sphere2);
	    this.foodMeshes.push(cylinder);
	    */
	    app.carnival.scene.add(stick);
	    
	},
	
	resetFood: function()
	{
		this.foodObjectActive= false;
		this.foodObject.position.x = this.object.position.x + 10;
	    this.foodObject.position.y = this.object.position.y + 10;
	    this.foodObject.position.z = this.object.position.z + 30;
		
		app.FoodStand.foodObject.scale.x = 1;
		app.FoodStand.foodObject.scale.y = 1;
		app.FoodStand.foodObject.scale.z = 1;
	},
	
	doRaycast: function(raycaster) {
		
		var array = [];
		var children = this.foodObject.children;
		array.push(children[0]);
		array.push(children[0].children[0]);
		array.push(children[0].children[1]);
		array.push(this.foodObject);
		
		var intersects = raycaster.intersectObjects(array);

		if (intersects.length > 0) {
			// Player clicked on corn dog
			if(!this.foodObjectActive)
			{
				console.log("take corn dog");
				this.foodObjectActive = true;
			}
		}
	},

	update: function()
	{
		if(!this.foodObjectActive && this.foodObject)
		{
			this.foodObject.rotation.y += 0.02;
			
			this.foodObject.position.y += 0.03*this.foodObjectBob;
			if(this.foodObject.position.y > this.object.position.y + 11)
			{
				this.foodObjectBob = -1;
			}
			else if(this.foodObject.position.y < this.object.position.y + 9)
			{
				this.foodObjectBob = 1;
			}
		}
	},

};
