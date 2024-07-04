"use strict";
var app = app || {};

// Avatars or "people" that wander around the carnival
app.Avatar = (function () {
  // Create an avatar and randomize its x,z position
  function Avatar() {
    this.radius = 10;
    this.height = 15;

    var FullGeo = new THREE.Geometry();
    // Make a cylinder
    var geo = new THREE.CylinderGeometry(this.radius, this.radius, this.height);
    var mat = new THREE.MeshPhongMaterial({color: 0xff0000});
    //var mesh = new THREE.Mesh(this.geo);

    // Make to spheres to make it a capsule
    var sphereGeo = new THREE.SphereGeometry(this.radius);
    var sphere1 = new THREE.Mesh(sphereGeo);
    var sphere2 = new THREE.Mesh(sphereGeo);

    sphere1.position.y = geo.height / 2;
    sphere2.position.y = -geo.height / 2;

    THREE.GeometryUtils.merge(FullGeo, geo);
    THREE.GeometryUtils.merge(FullGeo, sphere1);
    THREE.GeometryUtils.merge(FullGeo, sphere2);

    this.mesh = new THREE.Mesh(FullGeo, mat);
    this.mesh.castShadow = true;

    this.mesh.position.y = 17;
    this.mesh.position.x = app.utilities.getRandom(-900, 900);
    this.mesh.position.z = app.utilities.getRandom(-900, 900);

    this.mesh.rotation.y = app.utilities.getRandom(0, Math.PI * 2);
    this.speed = 1;
  }

  var p = Avatar.prototype;

  p.move = function () {
    // move the avatar around in its given direction
    this.mesh.position.x += this.speed * Math.sin(this.mesh.rotation.y);
    this.mesh.position.z += this.speed * Math.cos(this.mesh.rotation.y);

    if (this.mesh.position.x < -900) {
      this.mesh.rotation.y = app.utilities.getRandom(0, Math.PI);
    } else if (this.mesh.position.x > 900) {
      this.mesh.rotation.y = app.utilities.getRandom(Math.PI, Math.PI * 2);
    }
    if (this.mesh.position.z < -900) {
      this.mesh.rotation.y = app.utilities.getRandom(0, Math.PI / 2);
    } else if (this.mesh.position.z > 900) {
      this.mesh.rotation.y = app.utilities.getRandom(
        Math.PI / 2,
        (Math.PI * 3) / 2,
      );
    }
  };

  // Fungsi untuk mengecek collision
  p.checkCollision = function (otherObject) {
    // Jarak antara pusat avatar dan pusat objek lain
    var distance = this.mesh.position.distanceTo(otherObject.mesh.position);

    // Mengembalikan true jika terjadi collision
    return distance < this.radius + otherObject.getRadius();
  };

  return Avatar;
})();
