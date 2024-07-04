"use strict";

var app = app || {};

app.ferrisWheel = {

	angle: 0,
	speed: 0.003,
	Partitions: 15,
	PartitionLength: 250,
	PartitionThickness:15,
	BaseWidth: 100,
	BaseAngle: Math.PI/5,
	BaseLengthModifier: 9/8,
	LightChanger: 0,
	LightChanger2: 20,
	LightTime: 20,
	LightEffect:0,
	MaxLightsover2: 5,
	LightMatOn: undefined,
	LightMatOff: undefined,
	all:undefined,
	structure: undefined,
	lights: [],
	seats: undefined,
	base: undefined,
	camera: undefined,
	controls:undefined,

	active: false,
	keydown:false,

	initCamera: function( fov, aspect, near, far )
	{
		//create camera
		this.camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
		this.controls = new THREE.FirstPersonControls(this.camera);
		this.controls.movementSpeed = 0;
		this.controls.lookSpeed = 0.18;
		this.controls.autoForward = false;
	},

	init : function(speed)
	{
		this.seats = undefined;
		this.base = undefined;
		this.all = undefined;
		this.structure = undefined;
		this.lights=[];
		
		if(speed)
		{
			this.speed = speed;
		}
		
		//init light materials
		this.LightMatOff = new THREE.MeshBasicMaterial( {color: 0x888800} );
		this.LightMatOn = new THREE.MeshBasicMaterial( {color: 0xffff00} );

		//create structure
		this.structure = new THREE.Object3D();
		
		var greyBars = new THREE.Geometry();
		var innerBars = new THREE.Geometry();
		for(var i = 0; i< this.Partitions;i++)
		{
			var newAngle = (Math.PI*2/this.Partitions)*(i+0.5);
			var newAngle2 = (Math.PI*2/this.Partitions)*(i);
			
			for(var j = -1; j < 2; j=j+2)
			{
				var lookAt = new THREE.Vector3(0,0,0);
				//radial bars
				var structureG = new THREE.CylinderGeometry(this.PartitionThickness/4,this.PartitionThickness/4,this.PartitionLength,32);
				
				var structure = new THREE.Mesh(structureG);

				structure.position.x = ( (this.PartitionLength/2)*(Math.cos(newAngle)));
				structure.position.z = ( (this.PartitionLength/2)*(Math.sin(newAngle)));
				
				structure.lookAt(lookAt);


				structure.rotateOnAxis(new THREE.Vector3(0,0,1),Math.PI/2);
				structure.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI/2);

				structure.position.y = j*this.BaseWidth/3 - (j*this.PartitionThickness/4 + j*this.PartitionThickness/20);
				
				//add lights to radial bars
				var dist = this.PartitionLength/(this.MaxLightsover2*2);
				for(var k = -this.MaxLightsover2; k < this.MaxLightsover2;k++)
				{
					var curDist = this.PartitionLength/2 + (dist*(k+1));
					
					var geometry = new THREE.SphereGeometry( 2, 32, 32 );
					var material = this.LightMatOff;
					var sphere = new THREE.Mesh( geometry, material );
					sphere.name = k;
				
					sphere.position.set(((curDist)*(Math.cos(newAngle))),0,(curDist)*(Math.sin(newAngle)));
					
					sphere.position.y = j*this.BaseWidth/3 - (j*this.PartitionThickness/3 + j*this.PartitionThickness/20) + j*5;
					this.structure.add(sphere);
					this.lights.push(sphere);
				}	
				
				
				THREE.GeometryUtils.merge(greyBars,structure);
				//end radial bars

				//inner bars
				var structureG2 = new THREE.CylinderGeometry(this.PartitionThickness/4,this.PartitionThickness/4,((this.PartitionLength*Math.PI)/this.Partitions)*3.45,32);
				var structure2 = new THREE.Mesh(structureG2);

				structure2.position.x = ( (this.PartitionLength/2)*(Math.cos(newAngle2)));
				structure2.position.z = ( (this.PartitionLength/2)*(Math.sin(newAngle2)));

				structure2.lookAt(lookAt);

				structure2.rotateOnAxis(new THREE.Vector3(0,0,1),Math.PI/2);

				structure2.position.y = j*this.BaseWidth/3 - (j*this.PartitionThickness/4 + j*this.PartitionThickness/20);
				
				THREE.GeometryUtils.merge(innerBars,structure2);
				//end inner bars
				//outer bars
				var structureG3 = new THREE.CylinderGeometry(this.PartitionThickness/4,this.PartitionThickness/4,((this.PartitionLength*Math.PI*2)/this.Partitions),32);
				var structure3 = new THREE.Mesh(structureG3);

				structure3.position.x = ( (this.PartitionLength-this.PartitionThickness/4)*(Math.cos(newAngle2)));
				structure3.position.z = ( (this.PartitionLength-this.PartitionThickness/4)*(Math.sin(newAngle2)));

				structure3.lookAt(lookAt);

				structure3.rotateOnAxis(new THREE.Vector3(0,0,1),Math.PI/2);

				structure3.position.y = j*this.BaseWidth/3 - (j*this.PartitionThickness/4 + j*this.PartitionThickness/20);
				
				THREE.GeometryUtils.merge(greyBars,structure3);
				//end outer bars
			}


		}
		var M1 = new THREE.MeshPhongMaterial({color: 0xbbbbbb, overdraw: true, shininess: 50});
		var M2 = new THREE.MeshPhongMaterial({color: 0x44bbff, overdraw: true, shininess: 50});
		
		var radialBarsMesh = new THREE.Mesh(greyBars,M1);
		var innerBarsMesh = new THREE.Mesh(innerBars,M2);
		
		//add all to structure
		radialBarsMesh.castShadow = true;
		innerBarsMesh.castShadow = true;
		this.structure.add(radialBarsMesh);
		this.structure.add(innerBarsMesh);

		var structureG = new THREE.CylinderGeometry(this.PartitionThickness,this.PartitionThickness,this.BaseWidth,32);
		//var allM = new THREE.MeshBasicMaterial({color:0xaaaaaa});
		var structureM= new THREE.MeshPhongMaterial({color: 0xbbbbbb, overdraw: true, shininess: 50});
		var structure = new THREE.Mesh(structureG,structureM);
		structure.castShadow = true;
		this.structure.add(structure);

		//create base
		this.base = new THREE.Object3D();
		var base = new THREE.Geometry();
		var baseM = new THREE.MeshPhongMaterial({color: 0xbbbbbb, overdraw: true, shininess: 50});
		for(var i = -1; i < 2; i= i+2)
		{
			for(var j = -1; j < 2; j= j+2)
			{
				var lookAt = new THREE.Vector3(0,0,0);
				var length = (this.PartitionLength*this.BaseLengthModifier)/Math.cos(this.BaseAngle);
				
				var baseG = new THREE.CylinderGeometry(this.PartitionThickness/3,this.PartitionThickness/3,length,32);
				var baseBar = new THREE.Mesh(baseG);
				
				baseBar.position.x = ( (length/2)*(Math.cos(this.BaseAngle*i+Math.PI)));
				baseBar.position.z = ( (length/2)*(Math.sin(this.BaseAngle*i+Math.PI)));
				
				baseBar.lookAt(lookAt);
				
				baseBar.rotateOnAxis(new THREE.Vector3(0,0,1),Math.PI/2);
				baseBar.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI/2);

				baseBar.position.y = j * this.BaseWidth/2 - (j * this.PartitionThickness/3 + j*this.PartitionThickness/20);
				
				THREE.GeometryUtils.merge(base,baseBar);
			}
			
		}
		var fullbase = new THREE.Mesh(base,baseM);
		fullbase.castShadow = true;
		this.base.add(fullbase);
		
		//create seats
		this.seats = new THREE.Object3D();
		for(var i = 0; i< this.Partitions;i++)
		{
			var newAngle = (Math.PI*2/this.Partitions)*(i+0.5);

			var structureG = new THREE.CubeGeometry(this.BaseWidth/3,this.BaseWidth/1.6-this.PartitionThickness,this.BaseWidth/3);
			//var structureM = new THREE.MeshBasicMaterial({color:0xaaffaa});
			var structureM = new THREE.MeshPhongMaterial({color: 0x9db3b5, overdraw: true, shininess: 50});
			var seat = new THREE.Mesh(structureG,structureM)


			seat.position.x = ( (this.PartitionLength)*(Math.cos(newAngle)));
			seat.position.z = ( (this.PartitionLength)*(Math.sin(newAngle)));
			
			seat.castShadow = true;
			this.seats.add(seat);
		}


		//stand up the ferrisWheel
		this.structure.rotation = new THREE.Euler( 0, 0, Math.PI/2, 'XYZ' );
		this.seats.rotation = new THREE.Euler(0,0,Math.PI/2,'XYZ');
		this.base.rotation = new THREE.Euler(0,0,Math.PI/2,'XYZ');
		
		//add structure and seats to wheel
		this.all = new THREE.Object3D();
		this.all.add(this.structure);
		this.all.add(this.base);
		this.all.add(this.seats);
		this.all.add(this.camera);
	},

	Update : function(light)
	{
		if(this.structure.rotation.x > Math.PI*2)
		{
			this.resetWheel();
			console.log(this.structure.rotation.x);
		}
		if(app.keydown[72] && !this.keydown)
		{
			if(this.active)
			{
				this.resetWheel();
			}
			else
			{
				this.resetWheel();
				this.active = true;
			}
		}
		if(app.keydown[72] != this.keydown)
		{
			this.keydown = app.keydown[72];
		}
		
		if(app.keydown[75])
		{
			this.speed-=0.001;
			if(this.speed < 0.001)
			{
				this.speed = 0.001;
			}
			app.keydown[75] = false;
		}
		
		if(app.keydown[76])
		{
			this.speed+=0.001;
			if(this.speed > 0.050)
			{
				this.speed = 0.050;
			}
			app.keydown[76] = false;
		}
		
		if(this.active)
		{
			this.structure.rotation.x += this.speed;

			this.seats.rotation.x += this.speed;

			var seatChildren = this.seats.children;
			for(var k = 0; k < seatChildren.length; k++)
			{
				seatChildren[k].rotation.y+=this.speed;
			}

			//this.controls.object.rotation.z+=Math.PI/2;

			this.camera.position.y = this.structure.position.x -( (this.PartitionLength)*(Math.cos(this.structure.rotation.x)));
			this.camera.position.z = this.structure.position.z -( (this.PartitionLength)*(Math.sin(this.structure.rotation.x)))-10;

		}
		else
		{
			this.structure.rotation.x += this.speed;

			this.seats.rotation.x += this.speed;

			var seatChildren = this.seats.children;
			for(var k = 0; k < seatChildren.length; k++)
			{
				seatChildren[k].rotation.y+=this.speed;
			}
		}
		
		if(light < 0.85)
		{
			//move lights
			
			this.LightChanger2++;
			
			if(this.LightChanger2 > this.LightTime)
			{
				this.LightChanger2 = 0;
				this.LightChanger--;
				if(this.LightChanger < -this.MaxLightsover2)
				{
					this.LightChanger = this.MaxLightsover2-1;
				}
				for(var i = 0; i < this.lights.length; i++)
				{
					if(this.LightEffect == 0)
					{
						if(this.lights[i].name == this.LightChanger)
						{
							this.lights[i].material = this.LightMatOn;
						}
						else
						{
							this.lights[i].material = this.LightMatOff;
						}
					}
					else
					{
						
					}
				}
			}
		}
		else if(light < 0.87)
		{
			for(var i = 0; i < this.lights.length; i++)
			{
				this.lights[i].material = this.LightMatOff;
			}
		}
		
	},
	
	//resets wheel for riding and other things
	resetWheel : function()
	{
		this.active = false;
		//this.controls.object.rotation = new THREE.Euler( Math.PI/2, 0, 0, 'XYZ' );
		this.camera.rotateOnAxis(new THREE.Vector3(0,1,0),Math.PI/2);
		this.controls.lon = 270;
		this.controls.lat = 0;

		this.structure.rotation.x = 0;
		this.seats.rotation.x = 0;
		var seatChildren = this.seats.children;
		for(var k = 0; k < seatChildren.length; k++)
		{
			seatChildren[k].rotation.y= 0;
		}
	}
};
