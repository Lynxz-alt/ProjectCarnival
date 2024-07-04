"use strict";
// if app exists use the existing copy
// else create a new object literal
var app = app || {};

app.carnival = {
  // CONSTANT properties

  // variable properties
  renderer: undefined,
  scene: undefined,
  camera: undefined,
  light: undefined,
  light1: undefined,
  ferisWheel: undefined,
  controlsType: 'firstPerson',
  firstPersonControls: undefined,
  cinematography: undefined,
  freeRoom: undefined,
  myavatars: [],
  mytrees: [],
  paused: false,
  dt: 1 / 60,
  controls: undefined,
  treeDown: false,

  init: function (fov, height, width, aspect, near, far) {
    console.log("init called");
    this.setupThreeJS(fov, height, width, aspect, near, far);
    app.ferrisWheel.initCamera(fov, aspect, near, far);
    app.GameStand.initCamera(fov, aspect, near, far);
    this.setupWorld();
    this.update();
  },

  update: function () {
    // schedule next animation frame
    app.stats.update();
    app.animationID = requestAnimationFrame(this.update.bind(this));

    // PAUSED?
    if (app.paused) {
      this.drawPauseScreen();
      return;
    }

    // UPDATE
    if (this.controlsType === 'firstPerson') {
      this.firstPersonControls.update(this.dt);
  } else if (this.controlsType === 'freeRoom') {
      this.freeRoom.update(this.dt);
  } else if (this.controlsType === 'cinematography') {
      this.cinematography.update(this.dt);
  }

    // Update sky color
    //this.renderer.setClearColor( 0xffffff, 1);
    TWEEN.update();
    this.light.intensity = app.skytween.getSunLightIntensity() + 0.5;
    this.light1.intensity = app.skytween.getSunLightIntensity() + 0.5;

    // update ferrisWheel
    app.ferrisWheel.Update(this.light.intensity);
    app.ferrisWheel.Update(this.light1.intensity);

    // update game stand
    app.GameStand.update();

    // update avatars
    for (var i = 0; i < this.myavatars.length; i++) {
      this.myavatars[i].move();
    }

    // update corn dog
    if (app.FoodStand.foodObjectActive) {
      app.FoodStand.foodObject.scale.x = 0.3;
      app.FoodStand.foodObject.scale.y = 0.3;
      app.FoodStand.foodObject.scale.z = 0.3;

      app.FoodStand.foodObject.position.x =
        this.camera.position.x +
        10 * Math.cos((this.controls.lon + 30) * (Math.PI / 180));
      app.FoodStand.foodObject.position.z =
        this.camera.position.z +
        10 * Math.sin((this.controls.lon + 30) * (Math.PI / 180));
      app.FoodStand.foodObject.position.y = this.camera.position.y - 5;

      if (app.ferrisWheel.active || app.GameStand.active) {
        app.FoodStand.foodObject.scale.x = 1.0;
        app.FoodStand.foodObject.scale.y = 1.0;
        app.FoodStand.foodObject.scale.z = 1.0;

        var pos = app.FoodStand.object.position;

        app.FoodStand.foodObject.position.x = pos.x + 10;
        app.FoodStand.foodObject.position.z = pos.y + 10;
        app.FoodStand.foodObject.position.y = pos.z + 30;
      }
    }

    // DRAW
    if (app.ferrisWheel.active) {
      this.renderer.render(this.scene, app.ferrisWheel.camera);
      app.ferrisWheel.controls.update(this.dt);
    } else if (app.GameStand.active) {
      this.renderer.render(this.scene, app.GameStand.camera);
      //app.ferrisWheel.controls.update(this.dt);
    } else {
      this.renderer.render(this.scene, this.camera);
      this.controls.update(this.dt);
    }

    app.FoodStand.update();

    //camera constraints
    if (this.camera.position.y != 35) {
      this.camera.position.y = 35;
    }
    if (this.camera.position.x > 900) {
      this.camera.position.x = 900;
    }
    if (this.camera.position.x < -900) {
      this.camera.position.x = -900;
    }

    if (this.camera.position.z > 900) {
      this.camera.position.z = 900;
    }
    if (this.camera.position.z < -900) {
      this.camera.position.z = -900;
    }

        //reset camera
        if (app.keydown[82]) {
          this.camera.position.set(-800, 35, 0);
    
          this.controls.lon = -30;
          this.controls.lat = 0;
    
          app.FoodStand.resetFood();
          app.ferrisWheel.active = false;
        }

    //move light
    if (app.keydown[73]) {
      this.light.position.z += 10;
      if (this.light.position.z > 1200) {
        this.light.position.z = 1200;
      }
    }
    //move light 2
    if (app.keydown[79]) {
      this.light.position.z -= 10;
      if (this.light.position.z < -1200) {
        this.light.position.z = -1200;
      }
    }

    //move light
    if (app.keydown[73]) {
      this.light1.position.z += 10;
      if (this.light1.position.z > 1200) {
        this.light1.position.z = 1200;
      }
    }
    //move light 2
    if (app.keydown[79]) {
      this.light1.position.z -= 10;
      if (this.light1.position.z < -1200) {
        this.light1.position.z = -1200;
      }
    }

    //make a tree
    if (app.keydown[80] && !this.treeDown) {
      if (!(app.ferrisWheel.active || app.GameStand.active)) {
        var numTrees = this.mytrees.length;
        this.mytrees[numTrees] = new app.Tree();
        this.mytrees[numTrees].mesh.position.x =
          this.camera.position.x +
          100 * Math.cos(this.controls.lon * (Math.PI / 180));
        this.mytrees[numTrees].mesh.position.z =
          this.camera.position.z +
          100 * Math.sin(this.controls.lon * (Math.PI / 180));

        this.treeDown = true;
        this.scene.add(this.mytrees[numTrees].mesh);
      }
    }
    // don't spam trees
    if (app.keydown[80] != this.treeDown) {
      this.treeDown = app.keydown[80];
    }

    // untuk pergantian light 
    if (app.keydown[71]) {
      // Switch (key 'G')
      this.light.visible = false;
      this.light1.visible = true;
    }
    if (app.keydown[70]) {
      // Switch (key 'F')
      this.light.visible = true;
      this.light1.visible = false;
    }

    // Update avatars
    for (var i = 0; i < this.myavatars.length; i++) {
      this.myavatars[i].move();

      // Periksa collision dengan pohon
      for (var j = 0; j < this.mytrees.length; j++) {
        if (this.myavatars[i].checkCollision(this.mytrees[j])) {
          // Jika terjadi collision, hentikan pergerakan avatar
          this.myavatars[i].mesh.position.x -=
            this.myavatars[i].speed *
            Math.sin(this.myavatars[i].mesh.rotation.y);
          this.myavatars[i].mesh.position.z -=
            this.myavatars[i].speed *
            Math.cos(this.myavatars[i].mesh.rotation.y);

          // Putar avatar ke arah acak (agar tidak stuck)
          this.myavatars[i].mesh.rotation.y = app.utilities.getRandom(
            0,
            Math.PI * 2,
          );
          break; // Hentikan loop pohon karena sudah ditemukan collision
        }
      }
    }
  },

  setupThreeJS: function (fov, height, width, aspect, near, far) {
    this.scene = new THREE.Scene();
    //this.scene.fog = new THREE.FogExp2(0x9db3b5, 0.002);

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.y = 35;
    this.camera.position.z = 0;
    this.camera.position.x = -800;

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(width, height);
    this.renderer.shadowMapEnabled = true;
    document.body.appendChild(this.renderer.domElement);

    this.firstPersonControls = new THREE.FirstPersonControls(this.camera);
    this.firstPersonControls.movementSpeed = 75;
    this.firstPersonControls.lookSpeed = 0.15;

    this.freeRoom = new FreeRoom(this.camera);
    this.freeRoom.moveSpeed = 50;

    this.cinematography = new Cinematography(this.camera);
    this.cinematography.moveSpeed = 50;
    
    if (this.controlsType === 'firstPerson') {
      this.controls = this.firstPersonControls;
    } else if (this.controlsType === 'freeRoom') {
      this.controls = this.freeRoom;
    } else if (this.controlsType === 'cinematography') {
      this.controls = this.cinematography;
    }
  },

  switchControls: function(type) {
    if (type === 'firstPerson' || type === 'freeRoom' || type === 'cinematography') {
      this.controlsType = type;
      this.controls = (type === 'firstPerson') ? this.firstPersonControls : this.freeRoom;
    }
  },

  setupWorld: function () {
    var geo = new THREE.PlaneGeometry(2000, 2000, 40, 40);
    var mat = new THREE.MeshPhongMaterial({color: 0x9db3b5, overdraw: true});

    var texture = THREE.ImageUtils.loadTexture("textures/grass.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);

    var maxAST = this.renderer.getMaxAnisotropy();
    texture.anisotropy = maxAST;

    var mat = new THREE.MeshPhongMaterial({map: texture});

    var floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // sky colors
    app.skytween.init();

    // directional light to represent sun
    this.light = new THREE.DirectionalLight(0xf9f1c2, 1);
    this.light.position.set(-500, 1500, 1000);
    this.light.castShadow = true;
    this.light.shadowMapWidth = 2048;
    this.light.shadowMapHeight = 2048;

    this.light1 = new THREE.SpotLight(0xf9f1c2, 1);
    this.light1.position.set(-500, 1500, 1000);
    this.light1.castShadow = false;
    this.light1.shadowMapWidth = 2048;
    this.light1.shadowMapHeight = 2048;
    this.light1.distance = 7000;

    // distance for near and far clipping planes
    var d = 1000;
    this.light.shadowCameraLeft = d;
    this.light.shadowCameraRight = -d;
    this.light.shadowCameraTop = d;
    this.light.shadowCameraBottom = -d;
    this.light.shadowCameraFar = 2500;

    this.light1.shadowCameraLeft = d;
    this.light1.shadowCameraRight = -d;
    this.light1.shadowCameraTop = d;
    this.light1.shadowCameraBottom = -d;
    this.light1.shadowCameraFar = 2500;
    this.light1.visible = true;
    //this.light.castShadow = true;
    this.scene.add(this.light);
    this.scene.add(this.light1);

    var ambientLight = new THREE.AmbientLight(0x303030); // soft white light
    ambientLight.intensity = 0.01;
    this.scene.add(ambientLight);

    //ferris wheel
    app.ferrisWheel.init();
    app.ferrisWheel.all.position.set(
      1,
      app.ferrisWheel.PartitionLength * app.ferrisWheel.BaseLengthModifier,
      1,
    );
    this.scene.add(app.ferrisWheel.all);

    // obj loader
    app.FoodStand.load("textures/foodstand.jpg", "models/stand1.obj");
    app.GameStand.load("textures/gamestand.jpg", "models/stand2.obj");
    app.Tent.load(null, "models/tent2.obj");
    app.Tent.loadPizza("textures/pizza.jpg", "models/pizza_box_v01.obj");

    for (var i = 0; i < 2; i++) {
      app.BackgroundTents.load(null, "models/tent2.obj");
    }

    // people avatars
    for (var i = 0; i < 10; i++) {
      this.myavatars[i] = new app.Avatar();
      this.scene.add(this.myavatars[i].mesh);
    }

    // trees
    for (var i = 0; i < 40; i++) {
      this.mytrees[i] = new app.Tree();
      this.scene.add(this.mytrees[i].mesh);
    }

    //instructions
    var cylinderG = new THREE.CylinderGeometry(3, 3, 40, 32);
    var cylinderM = new THREE.MeshLambertMaterial({color: 0xbb2222});
    var cylinder1 = new THREE.Mesh(cylinderG, cylinderM);
    var cylinder2 = new THREE.Mesh(cylinderG, cylinderM);
    cylinder1.position.set(-700, 20, 0);
    cylinder1.castShadow = true;
    cylinder2.position.set(-700, 20, -40);
    cylinder2.castShadow = true;

    var plane = new THREE.PlaneGeometry(40, 30, 1, 1);
    var texture = THREE.ImageUtils.loadTexture("textures/sign.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    var maxAST = this.renderer.getMaxAnisotropy();
    texture.anisotropy = maxAST;

    var mat = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8, // 80% opacity
    });

    var sign1 = new THREE.Mesh(plane, mat);
    var sign2 = new THREE.Mesh(plane, mat);
    sign1.rotation.y = -Math.PI / 2;
    sign1.position.set(-700 - cylinder1.geometry.radiusTop, 25, -20);
    sign1.castShadow = true;
    sign2.rotation.y = Math.PI / 2;
    sign2.position.set(-700 + cylinder1.geometry.radiusTop, 25, -20);
    sign2.castShadow = true;
    this.scene.add(sign1);
    this.scene.add(sign2);
    this.scene.add(cylinder1);
    this.scene.add(cylinder2);

    // Membuat loader untuk .obj dan tekstur .png
    var circusLoader = new THREE.OBJLoader();
    var textureLoader = new THREE.TextureLoader();

    textureLoader.load("models/circus_tent.png", function (texture) {
      circusLoader.load("models/circus_tent.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture, // Menerapkan tekstur
              color: 0xffffe0, // Warna kuning cerah (jika ingin menambahkan warna dasar)
              emissive: new THREE.Color(0x444422), // Cahaya lembut saat mati
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.rotation.set(1.6, 3.15, 5);
        object.scale.set(0.4, 0.4, 0.4); // Scale down the object
        object.position.set(800, -10, -500); // Set Y position to 0 or desired height
        app.carnival.scene.add(object);
      });
    });

    // Fountain
    var fountainLoader = new THREE.OBJLoader();
    var textureFountainLoader = new THREE.TextureLoader();

    textureFountainLoader.load("textures/Erato_C_Erato_O_Material_u1_v1.png", function (texture) {
      fountainLoader.load("models/Erato_C.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture, // Menerapkan tekstur
              color: 0xffffe0, // Warna kuning cerah (jika ingin menambahkan warna dasar)
              emissive: new THREE.Color(0x444422), // Cahaya lembut saat mati
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.position.set(-360,0,0);
        object.scale.set(5,5,5);
        object.rotation.y = Math.PI;
        object.castShadow = true;
			  object.receiveShadow = true;
        app.carnival.scene.add(object);
      });
    });

    // Lamp
    var lampLoader = new THREE.OBJLoader();
    var textureLampLoader = new THREE.TextureLoader();

    textureLampLoader.load("textures/Lamp.png", function (texture) {
      lampLoader.load("models/Lamp.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture, // Menerapkan tekstur
              color: 0xffffe0, // Warna kuning cerah (jika ingin menambahkan warna dasar)
              emissive: new THREE.Color(0x444422), // Cahaya lembut saat mati
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.scale.set(30,30,30); // Scale down the object
        object.position.set(-360, 1, -270); // Set Y position to 0 or desired height
        app.carnival.scene.add(object);
      });
    });

    // Carousel
    var carouselLoader = new THREE.OBJLoader();
    var textureCarouselLoader = new THREE.TextureLoader();

    textureCarouselLoader.load("textures/carousel.jpeg", function (texture) {
      carouselLoader.load("models/carousel.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture, // Menerapkan tekstur
              color: 0xffffe0, // Warna kuning cerah (jika ingin menambahkan warna dasar)
              emissive: new THREE.Color(0x444422), // Cahaya lembut saat mati
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.rotation.set(1,0,0);
        object.scale.set(10,10,10); // Scale down the object
        object.position.set(-800, 40, -600); // Set Y position to 0 or desired height
        app.carnival.scene.add(object);
      });
    });

    // Hotdog Cart
    var hotdogLoader = new THREE.OBJLoader();
    var textureHotdogLoader = new THREE.TextureLoader();

    textureHotdogLoader.load("textures/Hotdog.png", function (texture) {
      hotdogLoader.load("models/Hotdog.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture, // Menerapkan tekstur
              color: 0xffffe0, // Warna kuning cerah (jika ingin menambahkan warna dasar)
              emissive: new THREE.Color(0x444422), // Cahaya lembut saat mati
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.rotation.set(0, 90, 0);
        object.scale.set(30,30,30); // Scale down the object
        object.position.set(-480, 0, 270); // Set Y position to 0 or desired height
        app.carnival.scene.add(object);
      });
    });

    // Ice Cream Truck
    var iceCreamLoader = new THREE.OBJLoader();
    var textureIcecreamLoader = new THREE.TextureLoader();

    textureIcecreamLoader.load("textures/truck.png", function (texture) {
      iceCreamLoader.load("models/truck.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture, // Menerapkan tekstur
              color: 0xffffe0, // Warna kuning cerah (jika ingin menambahkan warna dasar)
              emissive: new THREE.Color(0x444422), // Cahaya lembut saat mati
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.rotation.set(0, 0, 0);
        object.scale.set(1,1,1); // Scale down the object
        object.position.set(-250, 63, 270); // Set Y position to 0 or desired height
        app.carnival.scene.add(object);
      });
    });

    // Bench
    var benchLoader = new THREE.OBJLoader();
    var textureBenchLoader = new THREE.TextureLoader();

    textureBenchLoader.load("textures/bench.png", function (texture) {
      benchLoader.load("models/bench.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture, // Menerapkan tekstur
              color: 0xffffe0, // Warna kuning cerah (jika ingin menambahkan warna dasar)
              emissive: new THREE.Color(0x444422), // Cahaya lembut saat mati
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.rotation.set(0, 0, 0);
        object.scale.set(7,7,7); // Scale down the object
        object.position.set(-420,0,-270); // Set Y position to 0 or desired height
        app.carnival.scene.add(object);
      });
    });

    // Bench 2
    var bench1Loader = new THREE.OBJLoader();
    var textureBench1Loader = new THREE.TextureLoader();

    textureBench1Loader.load("textures/bench.png", function (texture) {
      bench1Loader.load("models/bench.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture, // Menerapkan tekstur
              color: 0xffffe0, // Warna kuning cerah (jika ingin menambahkan warna dasar)
              emissive: new THREE.Color(0x444422), // Cahaya lembut saat mati
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.rotation.set(0, 0, 0);
        object.scale.set(7,7,7); // Scale down the object
        object.position.set(420,0,-270); // Set Y position to 0 or desired height
        app.carnival.scene.add(object);
      });
    });

    // Bench 3
    var bench2Loader = new THREE.OBJLoader();
    var textureBench2Loader = new THREE.TextureLoader();

    textureBench2Loader.load("textures/bench.png", function (texture) {
      bench2Loader.load("models/bench.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture, // Menerapkan tekstur
              color: 0xffffe0, // Warna kuning cerah (jika ingin menambahkan warna dasar)
              emissive: new THREE.Color(0x444422), // Cahaya lembut saat mati
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.rotation.set(0, 180, 0);
        object.scale.set(7,7,7); // Scale down the object
        object.position.set(420,0,270); // Set Y position to 0 or desired height
        app.carnival.scene.add(object);
      });
    });

    // Lamp 2
    var lamp1Loader = new THREE.OBJLoader();
    var textureLamp1Loader = new THREE.TextureLoader();

    textureLamp1Loader.load("textures/Lamp.png", function (texture) {
      lamp1Loader.load("models/Lamp.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture, // Menerapkan tekstur
              color: 0xffffe0, // Warna kuning cerah (jika ingin menambahkan warna dasar)
              emissive: new THREE.Color(0x444422), // Cahaya lembut saat mati
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.scale.set(30,30,30); // Scale down the object
        object.position.set(-360, 1, 270); // Set Y position to 0 or desired height
        app.carnival.scene.add(object);
      });
    });

    // Lamp 3
    var lamp2Loader = new THREE.OBJLoader();
    var textureLamp2Loader = new THREE.TextureLoader();

    textureLamp2Loader.load("textures/Lamp.png", function (texture) {
      lamp2Loader.load("models/Lamp.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture, // Menerapkan tekstur
              color: 0xffffe0, // Warna kuning cerah (jika ingin menambahkan warna dasar)
              emissive: new THREE.Color(0x444422), // Cahaya lembut saat mati
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.scale.set(30,30,30); // Scale down the object
        object.position.set(360, 1, 270); // Set Y position to 0 or desired height
        app.carnival.scene.add(object);
      });
    });

    // Lamp 4
    var lamp3Loader = new THREE.OBJLoader();
    var textureLamp3Loader = new THREE.TextureLoader();

    textureLamp3Loader.load("textures/Lamp.png", function (texture) {
      lamp3Loader.load("models/Lamp.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture, // Menerapkan tekstur
              color: 0xffffe0, // Warna kuning cerah (jika ingin menambahkan warna dasar)
              emissive: new THREE.Color(0x444422), // Cahaya lembut saat mati
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.scale.set(30,30,30); // Scale down the object
        object.position.set(480, 1, -270); // Set Y position to 0 or desired height
        app.carnival.scene.add(object);
      });
    });

    // Roller
    var rollerLoader = new THREE.OBJLoader();
    var textureRollerLoader = new THREE.TextureLoader();

    textureRollerLoader.load("models/roller.png", function (texture) {
      rollerLoader.load("models/roller.obj", function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              map: texture,
              color: 0xffffe0,
              emissive: new THREE.Color(0x444422),
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // object.rotation.set(1, 1, 0);
        object.scale.set(2.5, 2.5, 2.5); // Scale down the object
        object.position.set(600, 85, 300); // Set Y position to 0 or desired height
        app.carnival.scene.add(object);
      });
    });

    // Buat sumber cahaya PointLight untuk mengontrol intensitas lampu
    var pointLight = new THREE.PointLight(0xffd700, 0.0, 150);
    pointLight.castShadow = true;
    pointLight.position.set(-600, 10, -600); // Letakkan di dekat lampu pertama
    app.carnival.scene.add(pointLight);

    // Add the glass house to the scene
    this.addGlassHouse();
  },

  doRaycast: function (event) {
    event.preventDefault();
    var projector = new THREE.Projector();

    // Define the camera to use for raycasts
    var currentCam = this.camera;
    if (app.ferrisWheel.active) {
      currentCam = app.ferrisWheel.camera;
    } else if (app.GameStand.active) {
      currentCam = app.GameStand.camera;
    }

    // 2D point where we clicked on the screen
    var vector = new THREE.Vector3(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5,
    );
    //console.log("Vector is x=" + vector.x + ",y=" + vector.y + ",z=" + vector.z);

    // 2D point converted to 3D point in world
    projector.unprojectVector(vector, currentCam);
    //console.log("Unprojected Vector x=" + vector.x + ",y=" + vector.y +",z=" + vector.z);

    // cast a ray from the camera to the 3D point we clicked on
    var raycaster = new THREE.Raycaster(
      currentCam.position,
      vector.sub(currentCam.position).normalize(),
    );

    app.GameStand.doRaycast(raycaster);
    app.FoodStand.doRaycast(raycaster);

    // an array of objects we are checking for intersections
    // you’ll need to put your own objects here
    var intersects = raycaster.intersectObjects([app.GameStand.mesh]);
  },

  startSoundtrack: function () {
    createjs.Sound.stop();
    createjs.Sound.play("soundtrack", {loop: -1, volume: 0.5});
  },

  addGlassHouse: function () {
    // Glass house dimensions
    const width = 200;
    const height = 100;
    const depth = 120;

    // Create the box geometry for the glass house
    const geometry = new THREE.BoxGeometry(width, height, depth);

    // Create the glass material
    const glassMaterial = new THREE.MeshPhongMaterial({
      color: 0x87ceeb, // Light blue color
      transparent: true,
      opacity: 0.3, // 30% opaque
      side: THREE.DoubleSide
    });

    // Create the mesh for the glass house
    const glassHouse = new THREE.Mesh(geometry, glassMaterial);

    // Set the position of the glass house
    glassHouse.position.set(-360, height / 2, -720);

    // Create the box geometry for the door
    const doorWidth = 40;
    const doorHeight = 60;
    const doorDepth = 1;
    const doorGeometry = new THREE.BoxGeometry(
      doorWidth,
      doorHeight,
      doorDepth,
    );

    // Create the material for the door
    const doorMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b4513,// Brown color
      side: THREE.DoubleSide,
    });

    // Create the mesh for the door
    const door = new THREE.Mesh(doorGeometry, doorMaterial);

    // Set the position of the door, lower than before
    door.position.set(
      0,
      doorHeight / 8 - (height / 2 - doorHeight / 2),
      depth / 2 + doorDepth / 2,
    );

    // Enable shadows for the door
    door.castShadow = true;
    door.receiveShadow = true;

    // Add the door to the glass house
    glassHouse.add(door);

    // Create and add boxes inside the glass house without collisions
    const boxGeometry = new THREE.BoxGeometry(20, 20, 20);
    const boxes = [];

    function getRandomColor() {
      return Math.random() * 0xffffff;
    }

    function checkCollision(box1, box2) {
      const distance = box1.position.distanceTo(box2.position);
      return distance < 40; // Sum of half dimensions of each box
    }

    for (let i = 0; i < 5; i++) {
      const boxMaterial = new THREE.MeshPhongMaterial({
        color: getRandomColor(),
      });
      const box = new THREE.Mesh(boxGeometry, boxMaterial);

      let positionValid = false;
      while (!positionValid) {
        box.position.set(
          (Math.random() - 0.5) * (width - 40),
          (Math.random() - 0.5) * (height - 40),
          (Math.random() - 0.5) * (depth - 40),
        );

        positionValid = true;
        for (let j = 0; j < boxes.length; j++) {
          if (checkCollision(box, boxes[j])) {
            positionValid = false;
            break;
          }
        }
      }

      box.castShadow = true;
      box.receiveShadow = true;
      boxes.push(box);
      glassHouse.add(box);
    }

    // Add the glass house to the scene
    this.scene.add(glassHouse);
  },
};

document.addEventListener('keydown', function(event) {
  if (event.key === '1') {
      app.carnival.switchControls('firstPerson');
  } else if (event.key === '3') {
      app.carnival.switchControls('freeRoom');
  } else if (event.key === '2') {
      app.carnival.switchControls('cinematography');
  }
});