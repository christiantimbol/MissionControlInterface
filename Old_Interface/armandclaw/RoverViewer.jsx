
//this allows the rover to be seen, but index.jsx is contains the math to control the 3d images


var RoverViewer;
export default RoverViewer = React.createClass({
	getInitialProps: function() {
		return {ang1: 0, ang2: 0, onChange: () => {}};
	},

	componentDidMount: function() {
		var canvas = this.refs.canvas;
		
		this.oldAngle1 = 0;
		this.oldAngle2 = 0;
		this.oldAngle3 = 0;
		this.oldAngle4 = 0;

//changes environmental zoom
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 75, canvas.width/canvas.height, 0.1, 1000 );
		this.renderer = new THREE.WebGLRenderer({
			canvas: canvas
		});
		this.renderer.autoClear = true;
		this.renderer.setClearColor(0x222);

		this.renderer.setSize(canvas.width, canvas.height);

//changes light.. 
		this.light = new THREE.DirectionalLight( 0xffffff, 0.8 );
		this.light.position.set(0.5, 1, 10);
		this.scene.add(this.light);

		this.amblight = new THREE.AmbientLight( 0x909090 ); // soft white light
		this.scene.add( this.amblight );

//changes ball size in claw that is maniputable
		var geometryPointer = new THREE.SphereGeometry(6, 6, 6);
		var materialPointer = new THREE.MeshPhongMaterial( { color: 0x808080 } );
		this.pointer = new THREE.Mesh( geometryPointer, materialPointer );
		this.scene.add(this.pointer);

//mainbody of rover...
//(x = length, y=height, z=depth) 
//change dimensions according to new proportions 
		var geometryRover = new THREE.BoxGeometry( 50, 20, 50 );
		var materialRover = new THREE.MeshPhongMaterial( { color: 0x696969 } );
		this.rover = new THREE.Mesh( geometryRover, materialRover );
	//default values to position mainbody of rover in relation to other components
		this.rover.position.y = -10;
		this.rover.position.x = -25;
		this.scene.add(this.rover);

//(100 = area of grid)
//(10 = 10x10 gridlines)
		this.gridHelper = new THREE.GridHelper( 100, 10 );
		this.scene.add( this.gridHelper );
	//sets grid position to under the rover
		this.gridHelper.position.y = -20;

//size of balls at joints
		var geometryJoint = new THREE.SphereGeometry(5.1, 5.1, 5.1);
		this.joint1 = new THREE.Mesh( geometryJoint, materialRover );

//affects base to elbow cylinder value
	//(x = diameter of cylinder end that goes to base)
	//(y = diameter of cylinder end that goes to elbow)
	//(z = length of cylinder)
		var geometry = new THREE.CylinderGeometry(5, 5, this.props.length1, 5);
		var material = new THREE.MeshPhongMaterial( { color: 0xdc143c } );
		var cube = new THREE.Mesh( geometry, material );
		cube.position.y = -this.props.length1/2;
		this.joint1.add(cube);

//affects elbow to wrist cylinder value
	//(x,y,z,i affect same things as above)
		this.joint2 = new THREE.Mesh( geometryJoint, material );
		this.joint2.position.y = -this.props.length1;
		this.joint1.add(this.joint2);
		var geometry2 = new THREE.CylinderGeometry(5, 5, this.props.length2, 5);
		var material2 = new THREE.MeshPhongMaterial( { color: 0x2e8b57 } );
		var cube2 = new THREE.Mesh( geometry2, material2 );
		cube2.position.y = -this.props.length2/2;
		this.joint2.add(cube2);

//affects wrist to claw visualization
		this.joint3 = new THREE.Mesh( geometryJoint, material );
		this.joint3.position.y = -this.props.length2;
		this.joint2.add(this.joint3);
	//(x,y,z = dimensions of rectangle which represents the claw)
		var geometryHand = new THREE.BoxGeometry( 5, 20, 20 );
		this.hand = new THREE.Mesh(geometryHand, material2);
		this.hand.position.y = -10;
		this.joint3.add(this.hand);

		this.scene.add( this.joint1 );

		this.camera.position.x = this.props.cameraPos.x;
		this.camera.position.y = this.props.cameraPos.y;
		this.camera.position.z = this.props.cameraPos.z;

		this.camera.rotation.x = this.props.cameraRot.x;
		this.camera.rotation.y = this.props.cameraRot.y;
		this.camera.rotation.z = this.props.cameraRot.z;

//deleted by default	
		// this.camera2.rotation.x = -Math.PI/2;
		// this.camera2.position.y = 150;

		// this.camera3.position.x = -100;
		// this.camera3.position.y = 40;
		// this.camera3.rotation.y = -Math.PI/2;

		this.renderer.render(this.scene, this.camera);

		canvas.style.width = "100%";

	//// controls
		//sets default position of arm on page load
		if (this.props.onChange) {
	    this.control = new THREE.TransformControls( this.camera, canvas );
			this.control.position.x = 20;
			this.control.position.y = 20;
			this.control.position.z = 0;

	    this.control.addEventListener( 'change', () => {
				this.props.onChange(this.control.position.x, -this.control.position.y, this.control.position.z);
				this.renderThreeJS();
	    } );
	   
	    //this adds the xyz axis arrows to the model at the base of the wrist
	    this.control.setMode( "translate" );
	    this.control.setSize(2);

	    this.control.attach( this.pointer );
	    this.scene.add( this.control );
		}

		// orbit/view controls for the top left figure
		// three finger rotation... two finger zoom
		if (this.props.orbit) {

	    this.orbitControls = new THREE.OrbitControls( this.camera, canvas );
	    this.orbitControls.enableDamping = true;
	    this.orbitControls.dampingFactor = 0.25;
	    this.orbitControls.rotateSpeed = 0.1;
	    this.orbitControls.enableZoom = true;

	    this.orbitControls.addEventListener( 'change', () => {
				this.renderThreeJS(true);
	    } );
	  }


	  this.interval = () => {
			if (this.control)
				this.control.update();
			if (this.orbitControls)
				this.orbitControls.update();
	  }

	//refresh interval
	  setInterval(this.interval, 100);

    this.resizeListener = (e) => {
    	this.renderer.setSize(this.refs.canvas.parentElement.clientWidth, this.refs.canvas.parentElement.clientWidth*(9/16));

 	//aspect ratio
 		// commented out by default
    	// this.renderer.aspect = 9/16;

    	// changed the camera.aspect 
    	// this.camera.aspect = 16/9;
    	this.camera.aspect = 16/9;
    	this.camera.updateProjectionMatrix();

    	// re render after resize
    	if (this.control)
				this.control.visible = true;

			this.renderer.render(this.scene, this.camera);

    	if (this.control)
				this.control.visible = false;
    };

    this.resizeListener();

    window.addEventListener('resize', this.resizeListener);
	},

	componentWillUnmount: function() {
		window.removeEventListener('resize', this.resizeListener);
		clearInterval(this.interval);
	},


//allows the sliders to re-render the 3D model in real-time
//e.g. deleting "this.oldAngle3 or 4" prevents the base rotation when manipulating those sliders
	renderThreeJS: function(forced) {

		if (
			Math.abs(this.props.ang1 - this.oldAngle1) < 0.01 &&
			Math.abs(this.props.ang2 - this.oldAngle2) < 0.01 &&
			Math.abs(this.props.ang3 - this.oldAngle3) < 0.01 &&
			Math.abs(this.props.ang4 - this.oldAngle4) < 0.01 &&
			!forced
		) {
			return;
		}
		
		this.oldAngle1 = this.props.ang1;
		this.oldAngle2 = this.props.ang2;
		this.oldAngle3 = this.props.ang3;
		this.oldAngle4 = this.props.ang4;

		this.joint1.rotation.z = this.props.ang1 + Math.PI/2;
		this.joint2.rotation.z = this.props.ang2 + Math.PI;
		this.joint1.rotation.y = this.props.ang3 - Math.PI/2;
		this.joint3.rotation.z = this.props.ang4;

		this.refs.canvas.style.height = this.refs.canvas.clientWidth * (9/16) + "px";

		this.renderer.setSize(this.refs.canvas.clientWidth, this.refs.canvas.clientHeight);

		if (this.control)
			this.control.visible = true;

		this.renderer.render(this.scene, this.camera);

		if (this.control)
			this.control.visible = false;

		this.pointer.position.x = this.props.pos.x;
		this.pointer.position.y = -this.props.pos.y;
		this.pointer.position.z = this.props.pos.z;

	},

	componentDidUpdate: function() {
		this.renderThreeJS();
	},

	render: function() {
		return (
			<div width="100%" onMouseMove={() => this.orbitControls ? this.renderThreeJS(true) : null}>
				<canvas ref="canvas" width="250" height="250" onMouseMove={this.moveMouse}/>
			</div>
		);
	}
});
