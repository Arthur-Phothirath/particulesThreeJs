import { AxesHelper, BoxBufferGeometry, BufferGeometry, Float32BufferAttribute, MathUtils, Mesh, MeshNormalMaterial, PerspectiveCamera, Points, PointsMaterial, Scene, TextureLoader, WebGLRenderer, VertexColors, Group, Clock, Line, LineBasicMaterial, SphereGeometry, MeshPhysicalMaterial, CanvasTexture, RepeatWrapping, Vector2, SphereBufferGeometry } from 'three'
import * as THREE from './build/three.module';
import {FlakesTexture} from './moduleJS/FlakesTexture';
import {RGBELoader} from './moduleJS/RGBELoader';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import './style.css'

const gui = new dat.GUI();
const textureLoader = new TextureLoader();
const circleTexture = textureLoader.load("/circle.png");
const alphaMap = textureLoader.load("/alphaMap.png");
const scene = new Scene();
const count = 100;
const distance = 4;

scene.add(new AxesHelper(1));

// Renderer

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.outputEncoding = THREE.sRGBEncoding;

renderer.setClearColor(0x000000, 0)
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
document.body.appendChild(renderer.domElement);


// Camera

const camera = new PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.95, 1000);

camera.position.z = 3.5;
camera.position.y = 0.2;
camera.position.x = 0.5;
scene.add(camera);

// PointLight

let pointlight;
pointlight = new THREE.PointLight(0xffffff, 1);
pointlight.position.set(200, 200, 200);
scene.add(pointlight);

// Random Generator

const points = new Float32Array(count * 3)
const colors= new Float32Array(count * 3)
for(let i = 0; i < points.length; i++){
  points[i] = MathUtils.randFloatSpread(distance * 2),
  colors[i] = Math.random() * 0.5 + 0.5;
}

// FORME
const geometry = new BufferGeometry();
geometry.setAttribute("position", new Float32BufferAttribute(points,3));
geometry.setAttribute("color", new Float32BufferAttribute(colors,3));
const pointMaterial = new PointsMaterial({ 
  size: 0.2,
  vertexColors: VertexColors,
  alphaTest: 0.5,
  alphaMap: alphaMap,
  transparent: true,
  }
);

// SPHERE PART 

let envmaploader = new THREE.PMREMGenerator(renderer);

let sphere = new RGBELoader().setPath('textures/').load('cayley_interior_4k.hdr', function (hdrmap){
  let envmap = envmaploader.fromCubemap(hdrmap)
  let texture = new THREE.CanvasTexture(new FlakesTexture());
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.x = 10;
  texture.repeat.y = 6;
  
  const ballMaterial = {
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    metalness: 0.9,
    roughness: 0.5,
    color: 0x0BCEE9,
    normalMap: texture,
    normalScale: new Vector2(0.15, 0.15),
    envMap: envmap.texture
  };
  
  let ballGeo = new THREE.SphereGeometry(1, 32);
  let ballMat = new THREE.MeshPhysicalMaterial(ballMaterial);
  let ballMesh = new THREE.Mesh(ballGeo, ballMat);

  scene.add(ballMesh);
  
  // GUI Control Panel
  
  var selected = ballMesh

  var guiControls = function(){
    this.color = ballMat.color.getStyle();
  }();

  gui.addColor(guiControls, "color")
  .listen()
  .onChange(function(e){
    selected.material.color.setStyke(e);
  })
});


// Mesh and Material
const pointsObject = new Points(geometry, pointMaterial);
const group = new Group();
group.add(pointsObject);

const lineMaterial = new LineBasicMaterial({
  color: 0x000000,
  opacity: .05,
  depthWrite: false,
});

const lineObject = new Line(geometry, lineMaterial)
group.add(lineObject)

scene.add(group);



// Rotate control

const controls = new OrbitControls(camera, renderer.domElement)
const clock = new Clock();

let mouseX = 0;
window.addEventListener("mousemove", e => {
  mouseX = e.clientX
})

// TICK

function tick(){
  const time = clock.getElapsedTime();
  group.rotation.y = time * 0.07
  // group.rotateY(0.001 * Math.PI)

  renderer.render(scene, camera);
  // controls.update();
  
  const ratio = (mouseX / window.innerWidth - 0.5) * 2
  group.rotation.y = ratio * Math.PI * 0.1
  requestAnimationFrame(tick);
}

tick()

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth,window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
})