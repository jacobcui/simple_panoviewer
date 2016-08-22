var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var ZOOM_DELTA = 120;
var containerId;
var isUserInteracting = false,
    lon = 0, 
    lat = 0, 
    phi = 0, theta = 0;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseDown( event ) {
  event.preventDefault();
  isUserInteracting = true;
  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;
  onPointerDownLon = lon;
  onPointerDownLat = lat;
}

function onDocumentKeyDown(event){
	var angle = 12;
  isUserInteracting = true;
	switch(event.keyCode){
	case KEY_LEFT:
	  lon -= angle;
	  break;
	case KEY_UP:
	  lat += angle;
	  break;
	case KEY_RIGHT:
	  lon += angle;
	  break;
	case KEY_DOWN:
	  lat -= angle;
	  break;
	}
};

function onDocumentMouseMove( event ) {
  if ( isUserInteracting === true ) {
    lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
    lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
  }
}

function onDocumentMouseUp( event ) {
  isUserInteracting = false;
}

function onDocumentMouseWheel( event ) {
  // WebKit
  if ( event.wheelDeltaY ) {
    camera.fov -= event.wheelDeltaY * 0.05;
    // Opera / Explorer 9
  } else if ( event.wheelDelta ) {
    camera.fov -= event.wheelDelta * 0.05;
    // Firefox
  } else if ( event.detail ) {
    camera.fov += event.detail * 1.0;
  }
  camera.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame( animate );
  update();

}

var staticFreeze = false;

function update() {
  if ( !staticFreeze) {
    lon += 0.1;
  }
  if ( isUserInteracting === true ) {
    staticFreeze = true;
  }

  lat = Math.max( - 85, Math.min( 85, lat ) );
  phi = THREE.Math.degToRad( 90 - lat );
  theta = THREE.Math.degToRad( lon );

  camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
  camera.target.y = 500 * Math.cos( phi );
  camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

  camera.lookAt( camera.target );

  /*
	 // distortion
	 camera.position.copy( camera.target ).negate();
	 */

  renderer.render( scene, camera );
}

function init(containerId, imageUrl) {
  var container, mesh;
  container = document.getElementById( containerId );
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
  camera.target = new THREE.Vector3( 0, 0, 0 );
  scene = new THREE.Scene();
  var geometry = new THREE.SphereGeometry( 500, 60, 40 );
  geometry.scale( - 1, 1, 1 );

  var material;
  if (imageUrl.toLowerCase().indexOf('.mp4') > 0){
    var videoDomId = 'video';
    var video = document.getElementById(videoDomId);
    if (!video) {
		  video = document.createElement( 'video' );
    }

		video.width = window.innerWidth;
		video.height = window.innerHeight;
    video.controls = true;
		video.loop = true;
		video.muted = false;
		video.src = imageUrl;
		video.setAttribute( 'webkit-playsinline', 'webkit-playsinline', 'controls' );
		video.play();

		var texture = new THREE.VideoTexture( video );
		texture.minFilter = THREE.LinearFilter;
		texture.format = THREE.RGBFormat;
		material   = new THREE.MeshBasicMaterial( { map : texture } );
  } else {
    material = new THREE.MeshBasicMaterial( {
      map: new THREE.TextureLoader().load( imageUrl )
    });
  }


  mesh = new THREE.Mesh( geometry, material );

  scene.add( mesh );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
  document.addEventListener( 'MozMousePixelScroll', onDocumentMouseWheel, false);
	document.addEventListener( 'keydown', onDocumentKeyDown, false );

  document.addEventListener( 'dragover', function ( event ) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, false );

  document.addEventListener( 'dragenter', function ( event ) {

    document.body.style.opacity = 0.5;

  }, false );

  document.addEventListener( 'dragleave', function ( event ) {

    document.body.style.opacity = 1;

  }, false );

  document.addEventListener( 'drop', function ( event ) {

    event.preventDefault();

    var reader = new FileReader();
    reader.addEventListener( 'load', function ( event ) {

      material.map.image.src = event.target.result;
      material.map.needsUpdate = true;

    }, false );
    reader.readAsDataURL( event.dataTransfer.files[ 0 ] );

    document.body.style.opacity = 1;

  }, false );

  window.addEventListener( 'resize', onWindowResize, false );
}


function panoIt(containerId, imageUrl) {
  var camera, scene, renderer;


  init(containerId, imageUrl);
  animate();
}

