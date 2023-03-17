import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AxesHelper, BoxGeometry, DirectionalLight, Fog, Mesh, MeshBasicMaterial, MeshLambertMaterial, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, Texture, TextureLoader, Vector2, WebGLRenderer } from "three";
import * as THREE from 'three';
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

let doc = document;
let container;

function loadTexture(url: string) {
  new TextureLoader().load(url, (texture: Texture) => {
    console.log("🚀 ~ file: cloud.ts:51 ~ newTextureLoader ~ initRenderer:")
    initRenderer(texture)
  })
}


function initRenderer(texture: Texture) {
  container = doc.querySelector('#door') as HTMLElement;
  let scene = new Scene();
  // const light = new DirectionalLight(0xffffff, 0.5);
  // const camera: Camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
  let camera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
  // camera.position.z = 6000;
  camera.position.z = 100;
  const bg = new PlaneGeometry(20, 20)
  // texture.magFilter = THREE.LinearMipMapLinearFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  const geometry = new BoxGeometry(10, 10, 10);
  // const material = new MeshBasicMaterial({
  //   map: texture
  // })
  texture.wrapS = THREE.RepeatWrapping;
  // texture.repeat = new Vector2(2, 1);
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
  camera.lookAt(scene.position)
  // const material = new MeshBasicMaterial({
  //   color: 0xC41E3A
  // })
  // scene.add(light);
  const axes = new AxesHelper(100)
  const mesh1 = new Mesh(geometry, material);
  scene.add(mesh1);
  scene.add(axes)
  let renderer = new WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  const control = new OrbitControls(camera, renderer.domElement);
  // document.addEventListener('mousemove', onDocumentMouseMove, false);
  // window.addEventListener('resize', onWindowResize, false)

  function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
}


export { loadTexture };
