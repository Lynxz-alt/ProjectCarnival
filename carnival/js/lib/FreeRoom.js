function FreeRoom(object, domElement) {
    this.object = object;
    this.target = new THREE.Vector3(0, 0, 0);

    this.domElement = domElement !== undefined ? domElement : document;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.zoomIn = false;
    this.zoomOut = false;

    this.zoom = 1; // Initial zoom value
    this.maxZoom = 10; // Maximum zoom value
    this.minZoom = 0.5; // Minimum zoom value

    this.rotation = {
        x: 0,
        y: 0
    };

    this.viewHalfX = window.innerWidth / 2;
    this.viewHalfY = window.innerHeight / 2;

    this.domElement.addEventListener('keydown', this.onKeyDown.bind(this), false);
    this.domElement.addEventListener('keyup', this.onKeyUp.bind(this), false);
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);

    // Prevent context menu on right-click
    this.domElement.addEventListener('contextmenu', function(event) { event.preventDefault(); }, false);

    this.freeze = false;
    this.heightSpeed = false;
    this.heightMin = 0;
    this.heightMax = 1;
    this.heightCoef = 1;
    this.autoSpeedFactor = 0.0;
    this.movementSpeed = 1.5;
    this.lookSpeed = 0.1;
    this.activeLook = true;
    this.constrainVertical = false;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;
    this.lookVertical = true;
    this.lon = 0;
    this.lat = 0;
    this.phi = 0;
    this.theta = 0;
}

FreeRoom.prototype = {
    update: function(delta) {
        if (this.freeze) {
            return;
        }

        if (this.heightSpeed) {
            var y = THREE.Math.clamp(this.object.position.y, this.heightMin, this.heightMax);
            var heightDelta = y - this.heightMin;
            this.autoSpeedFactor = delta * (heightDelta * this.heightCoef);
        } else {
            this.autoSpeedFactor = 1.0;
        }

        // var actualMoveSpeed = delta * this.movementSpeed;

        if (this.moveForward) {
            this.object.translateZ(-this.movementSpeed);
        }
        if (this.moveBackward) {
            this.object.translateZ(this.movementSpeed);
        }

        if (this.moveLeft) {
            this.object.translateX(-this.movementSpeed);
        }
        if (this.moveRight) {
            this.object.translateX(this.movementSpeed);
        }

        // Zoom in and out
        if (this.zoomIn) {
            this.zoom += 0.01;
            this.zoom = Math.min(this.zoom, this.maxZoom); // Limit maximum zoom
        }
        if (this.zoomOut) {
            this.zoom -= 0.01;
            this.zoom = Math.max(this.zoom, this.minZoom); // Limit minimum zoom
        }

        // Adjust y based on zoom
        this.object.position.y = 100 * this.zoom;

        var actualLookSpeed = delta * this.lookSpeed;

        if (!this.activeLook) {
            actualLookSpeed = 0;
        }

        var verticalLookRatio = 1;

        if (this.constrainVertical) {
            verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
        }

        this.lon += this.mouseX * actualLookSpeed;
        if (this.lookVertical) {
            this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
        }

        this.lon = THREE.Math.clamp(this.lon);

        // Clamp the lat value between -85 and 85 degrees
        this.lat = Math.max(-85, Math.min(85, this.lat));
        this.phi = THREE.Math.degToRad(90 - this.lat);
        this.theta = THREE.Math.degToRad(this.lon);

        if (this.constrainVertical) {
            this.phi = THREE.Math.mapLinear(this.phi, 0, Math.PI, this.verticalMin, this.verticalMax);
        }

        var targetPosition = this.target;
        var position = this.object.position;

        targetPosition.x = position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
        targetPosition.y = position.y + 100 * Math.cos(this.phi);
        targetPosition.z = position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);

        this.object.lookAt(targetPosition);
    },

    onKeyDown: function(event) {
        switch (event.keyCode) {
            case 87: /*W*/ this.moveForward = true; break;
            case 65: /*A*/ this.moveLeft = true; break;
            case 83: /*S*/ this.moveBackward = true; break;
            case 68: /*D*/ this.moveRight = true; break;
        }
    },

    onKeyUp: function(event) {
        switch (event.keyCode) {
            case 87: /*W*/ this.moveForward = false; break;
            case 65: /*A*/ this.moveLeft = false; break;
            case 83: /*S*/ this.moveBackward = false; break;
            case 68: /*D*/ this.moveRight = false; break;
        }
    },

    onMouseMove: function(event) {
        if (this.domElement === document) {
            this.mouseX = event.pageX - this.viewHalfX;
            this.mouseY = event.pageY - this.viewHalfY;
        } else {
            this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
            this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
        }
    },

    onMouseDown: function(event) {
        console.log('Mouse down:', event.button); 
        switch (event.button) {
            case 0: // Left mouse button
                this.zoomOut = true;
                break;
            case 2: // Right mouse button
                this.zoomIn = true;
                break;
        }
    },

    onMouseUp: function(event) {
        console.log('Mouse up:', event.button); 
        switch (event.button) {
            case 0: // Left mouse button
                this.zoomOut = false;
                break;
            case 2: // Right mouse button
                this.zoomIn = false;
                break;
        }
    }
};
