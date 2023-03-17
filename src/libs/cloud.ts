import { Mesh } from './Mesh';
import { PerspectiveCamera, WebGLRenderer, Scene, PlaneGeometry, Plane, BufferGeometry, BoxGeometry, Fog, TextureLoader, Texture, ShaderMaterial, IUniform, Clock, Vector3, Group } from 'three';
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
const fragmentShader = `
precision mediump float;
uniform sampler2D map;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
varying vec2 vUv;
void main() {
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = smoothstep(fogNear, fogFar, depth);
  gl_FragColor = texture2D(map, vUv);
  gl_FragColor.w *= pow(gl_FragCoord.z, 20.0);
  gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);
}
`;
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`
let pWorld = new Vector3(0, 0, 0);
const clock = new Clock();
let position;
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
let clientX = 0;
let clientY = 0;
let container: HTMLElement;
let doc = document;
let renderer: WebGLRenderer;
let scene: Scene;
let camera: PerspectiveCamera;
const CloudCount = 8000;
const perCloudZ = 2; // 每个云所占z轴的长度
const cameraPositionZ = CloudCount * perCloudZ;// 所有的云一共的Z轴长度
// X轴和Y轴平移的随机参数
const RandomPositionX = 500;
const RandomPositionY = 120;
function onDocumentMouseMove(event: MouseEvent) {
  // const target = event.target as HTMLCanvasElement;
  // const width = target.clientWidth;
  // const height = target.clientHeight;
  // clientX = (event.clientX - width) / 2 - 1;
  // clientY = -(event.clientY - height) / 2 + 1;
}


function loadTexture(url: string) {
  new TextureLoader().load(url, (texture: Texture) => {
    console.log("🚀 ~ file: cloud.ts:51 ~ newTextureLoader ~ initRenderer:")
    initRenderer(texture)
  })
}


function initRenderer(texture: Texture) {
  container = doc.querySelector('#cloud') as HTMLElement;
  scene = new Scene();
  camera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;
  // 视点到裁剪面的距离
  // const height = Math.abs(atan * camera.position.z);
  const geometry = new BoxGeometry(100, 54)
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  // 模糊
  const fog = new Fog(0x4584b4, -100, 3000);
  const material = new ShaderMaterial({
    extensions: {
      shaderTextureLOD: true
    },
    uniforms: {
      map: {
        value: texture
      },
      fogColor: {
        value: fog.color
      },
      fogNear: {
        value: fog.near
      },
      fogFar: {
        value: fog.far
      }
    },
    vertexShader,
    fragmentShader,
    depthTest: false
  })
  let random = Math.random;
  const group = new Group();
  for(let i = 0; i < 8000; i++) {
    createColud(i);
  }
  const geometry = new THREE.PlaneGeometry(64, 64); // 64*64平面图形
  function createColud(i: number) {
    const planegeometry = new PlaneGeometry(64, 64);
    const plane = new Mesh(planegeometry, material);
    plane.position.x = random() * 1000 - 500;
    plane.position.y = -random() * Math.random() * 200 - 15;
    plane.position.z = i;
    plane.rotation.z = random() * Math.PI;
    plane.scale.x = plane.scale.y = random() * random() * 1.5 + 0.5;
    group.add(plane);
  }

  const mesh1 = new Mesh(geometry, material);
  scene.add(mesh1);
  // const mesh2 = new Mesh(geometry, material);
  // mesh2.position.z = -8000;
  scene.add(group);
  renderer = new WebGLRenderer();

  renderer.shadowMap.enabled = true;
  renderer.setSize(windowWidth, windowHeight);
  container.appendChild(renderer.domElement);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false)
  pWorld = scene.position;
  function render() {
    position = (clock.getDelta() * 1000 * 0.03) % 8000;
    pWorld.applyMatrix4(camera.matrixWorldInverse);	// world to view

    // position = ((new Date().getTime() - start_time) * 0.03) % 8000;
    camera.position.x += (clientX - pWorld.x) * 0.01;
    camera.position.y += (-clientY - pWorld.y) * 0.01;
    camera.position.z = -position + 8000;
    camera.position.x = camera.position.x;
    pWorld.y = camera.position.y;
    pWorld.z = camera.position.z - 1000;
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  render();
}
function onWindowResize() {
  windowHeight = window.innerHeight;
  windowWidth = window.innerWidth;
  camera.aspect = windowWidth / windowHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(windowWidth, windowHeight)
}
// function(geometry1: BufferGeometry, object2: Mesh) {
//   var isMesh = object2 instanceof Mesh;
//   // 顶点
//   var vertexOffset = geometry1.vertices.length;
//   // var uvPosition = geometry1.faceVertexUvs[0].length;
//   var geometry2 = isMesh ? object2.geometry : object2;
//   var vertices1 = geometry1.vertices;
//   var vertices2 = geometry2.vertices;
//   var faces1 = geometry1.faces;
//   var faces2 = geometry2.faces;
//   var uvs1 = geometry1.faceVertexUvs[0];
//   var uvs2 = geometry2.faceVertexUvs[0];

//   isMesh && object2.matrixAutoUpdate && object2.updateMatrix();

//   for (var i = 0, il = vertices2.length; i < il; i++) {
//     var vertex = vertices2[i];
//     var vertexCopy = new THREE.Vertex(vertex.position.clone());
//     isMesh && object2.matrix.multiplyVector3(vertexCopy.position);
//     vertices1.push(vertexCopy);
//   }

//   for (i = 0, il = faces2.length; i < il; i++) {
//     var face = faces2[i]; var faceCopy; var normal; var color;
//     var faceVertexNormals = face.vertexNormals;
//     var faceVertexColors = face.vertexColors;

//     if (face instanceof THREE.Face3) {
//       faceCopy = new THREE.Face3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset);
//     } else if (face instanceof THREE.Face4) {
//       faceCopy = new THREE.Face4(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset, face.d + vertexOffset);
//     }
//     faceCopy.normal.copy(face.normal);
//     for (let j = 0, jl = faceVertexNormals.length; j < jl; j++) {
//       normal = faceVertexNormals[j];
//       faceCopy.vertexNormals.push(normal.clone());
//     }

//     faceCopy.color.copy(face.color);
//     for (let j = 0, jl = faceVertexColors.length; j < jl; j++) {
//       color = faceVertexColors[j];
//       faceCopy.vertexColors.push(color.clone());
//     }

//     faceCopy.materials = face.materials.slice();

//     faceCopy.centroid.copy(face.centroid);

//     faces1.push(faceCopy);
//   }

//   for (i = 0, il = uvs2.length; i < il; i++) {
//     var uv = uvs2[i]; var uvCopy = [];
//     for (var j = 0, jl = uv.length; j < jl; j++) {
//       uvCopy.push(new THREE.UV(uv[j].u, uv[j].v));
//     }
//     uvs1.push(uvCopy);
//   }
// }

function getFaces(geometry: BufferGeometry) {
  const vertexArray = geometry.attributes.position.array;
  // 顶点集合
  const vertexes: Vector3[] = [];
  
  for (let i = 0; i < vertexArray.length; i+=3) {
    vertexes.push(new Vector3(vertexArray[i], vertexArray[i+1], vertexArray[i+2]));
  }
  // 面的顶点索引
  const indexs = geometry.index?.array;
  if (indexs && indexs.length > 0) {
    for (let i = 0; i < vertexArray.length; i+=3) {
      vertexes.push(new Vector3(vertexArray[i], vertexArray[i+1], vertexArray[i+2]));
    }
  }
}

function draw(url: string) {
  loadTexture(url);
}


export {
  draw
}
