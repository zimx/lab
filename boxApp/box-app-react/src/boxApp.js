
if (!Detector.webgl) Detector.addGetWebGLMessage();

$('#info-icon').click(function () { $('#info').fadeToggle('fast'); });

var container; //stats;

var camera, controls, scene, renderer;

// ------------------------------------------

var group, boxApp;

// categories
var shape, base_b, metal, color;

// OPTIONS

// shapes
var circle, square;

// base_b options
var pointCircle, fourPointSquare;

// shape color materials
var blue, red, green, colorless;

// metal materials
var platinum, gold;

// ------------------------------------------

var helper, mesh;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var FLOOR = 0;

var clock = new THREE.Clock();

init();
animate();

function init() {

  container = document.getElementById('container');
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 100000);
  camera.position.z = 650;
  camera.position.y = 500;

  controls = new THREE.OrbitControls(camera);
  controls.noPan = true;
  controls.noZoom = true;
  controls.minPolarAngle = 0; // radians
  controls.maxPolarAngle = Math.PI / 2; // radians

  scene = new THREE.Scene();

  // Ambient light // 404040
  var light = new THREE.AmbientLight(0x999999); // soft white light
  scene.add(light);


  // White directional light at half intensity shining from the top.
  var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);




  // Ground
  //helper = new THREE.GridHelper( 200, 40 );
  //helper.setColors( 0x000000, 0x808080 );
  //helper.position.y = FLOOR;
  // scene.add( helper );




  // baxApp MATERIALS ---------------------------------------

  // metal materials
  gold = new THREE.MeshLambertMaterial({ color: 0xf7d478, ambient: 0xa87e40, });
  platinum = new THREE.MeshLambertMaterial({ color: 0xcccccc, ambient: 0x808080, });

  metal = gold; // default starting metal


  // shape colors
  blue = new THREE.MeshPhongMaterial({ ambient: 0x033fb8, color: 0x396cf9, specular: 0xffffff, shininess: 100, transparent: true, opacity: 0.9 });
  red = new THREE.MeshPhongMaterial({ ambient: 0x8b0000, color: 0xb70000, specular: 0xffffff, shininess: 100, transparent: true, opacity: 0.9 });
  green = new THREE.MeshPhongMaterial({ ambient: 0x036600, color: 0x039100, specular: 0xffffff, shininess: 100, transparent: true, opacity: 0.9 });
  colorless = new THREE.MeshPhongMaterial({ ambient: 0x777777, color: 0xcccccc, specular: 0xffffff, shininess: 100, transparent: true, opacity: 0.9 });


  color = blue; // default starting color


  // END baxApp MATERIALS --------------------------------





  // baxApp MODELS ---------------------------------------

  group = new THREE.Object3D();


  var rs = 10; // baxApp scale

  var loader = new THREE.JSONLoader();

  // loader.load( "./models/mo-01.json", function ( geometry ) {
  //   geometry.computeVertexNormals();
  //   baxApp = new THREE.Mesh( geometry, metal );
  //   baxApp.scale.set( 20, 20, 20 );
  //   group.add( baxApp );
  //  });


  // load base_bs


  loader.load("./models/top-circle.js", function (geometry) {
    geometry.computeVertexNormals();
    pointCircle = new THREE.Mesh(geometry, metal);
    pointCircle.scale.set(rs, rs, rs);

    base_b = pointCircle;
    group.add(pointCircle);

  });

  loader.load("./models/top-square.js", function (geometry) {
    //geometry.computeVertexNormals();
    fourPointSquare = new THREE.Mesh(geometry, metal);
    fourPointSquare.scale.set(rs, rs, rs);
  });

  // load shapes

  loader.load("./models/sphere.json", function (geometry) {
    geometry.computeVertexNormals();
    circle = new THREE.Mesh(geometry, blue);
    circle.scale.set(rs, rs, rs);
    group.add(circle);

    shape = circle;
  });

  loader.load("./models/cube.json", function (geometry) {
    //geometry.computeVertexNormals();
    square = new THREE.Mesh(geometry, blue);
    square.scale.set(rs, rs, rs);
  });


  scene.add(group);

  // END baxApp MODELS ------------------------------------



  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });


  //renderer.setClearColor( 0xBBBBBB, 1 );
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // stats = new Stats();
  // stats.domElement.style.position = 'absolute';
  // stats.domElement.style.top = '0px';
  // container.appendChild( stats.domElement );
  // window.addEventListener( 'resize', onWindowResize, false );
}





function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseMove(event) {

  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);

}




// baxApp CHANGE FUNCTIONS ------------------------------
function changeShape(newShape) {
  group.remove(shape);
  shape = newShape;
  shape.material = color;
  group.add(shape);

  //base_b == bezel
  if (shape == circle && base_b != pointCircle) {
    group.remove(base_b);
    base_b = pointCircle;
    base_b.material = metal;
    group.add(base_b);
  }

  else if (shape == square && base_b != fourPointSquare) {
    group.remove(base_b);
    base_b = fourPointSquare;
    base_b.material = metal;
    group.add(base_b);
  }
}



function changeMetal(newMetal) {
  metal = newMetal;
  base_b.material = metal;
}

function changeColor(newColor) {
  color = newColor;
  shape.material = newColor;
}




// END baxApp CHANGE FUNCTIONS ------------------------------



function animate() {
  requestAnimationFrame(animate);
  render();
  //stats.update();
  controls.update();
}

function render() {

  var delta = clock.getDelta();

  group.rotation.y += delta * .16;

  renderer.render(scene, camera);
}
