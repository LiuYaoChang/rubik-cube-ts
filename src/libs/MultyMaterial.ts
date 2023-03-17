import { BoxGeometry, BufferAttribute, Color, Mesh, PerspectiveCamera, Scene, ShaderMaterial, Texture, TextureLoader, WebGLRenderer } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const fragmentShader = `
precision mediump float;
uniform sampler2D map;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(map, vUv);
}
`;
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const textureLoader = new TextureLoader();
function loader(url: string) {
  return textureLoader.loadAsync(url)
}


export function render(el: HTMLElement, urls: string[]) {
  const loaders = urls.map((url: string) => loader(url));
  Promise.all(loaders).then((textures) => {
    // 多纹理
    createCube(el, textures);
  })
}


export function createCube(el: HTMLElement, textures: Texture[]) {
  const width = el.clientWidth;
  const height = el.clientHeight;
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 30);

  camera.lookAt(scene.position);
  const renderer = new WebGLRenderer({
    antialias: false
  });
  renderer.setClearColor('#1e4877', 1.0);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  const materials = textures.map((texture: Texture) => {
    const material = new ShaderMaterial({
      uniforms: {
        map: {
          value: texture
        }
      },
      vertexShader,
      fragmentShader,
      depthTest: false
    })
    return material;
  });
  const cubeGeometry = new BoxGeometry(10, 10, 10);
  const uv = cubeGeometry.attributes.uv.array;
  if (uv.length > 0) {
    for (let i = 0; i < uv.length; i+= 8) {
      let start = i, end = i+ 8;
      const res = Array.from(uv).slice(start, end);
      console.log('---------------FACE UV ------------------------', res);
    }
  }
  const newUv = [0, 1, 0.3, 1, 0, 0.7, 0.3, 0.7];
  let uvs: number[] = [];
  for (let i = 0; i < 6; i++) {
    uvs = uvs.concat(newUv);
  }
  (cubeGeometry.attributes.uv as BufferAttribute).copyArray(uvs);
  console.log("🚀 ~ file: MultyMaterial.ts:74 ~ createCube ~ uvs:", cubeGeometry.attributes.uv)
  const mesh = new Mesh(cubeGeometry, materials);
  new OrbitControls(camera, renderer.domElement);
  scene.add(mesh);
  el.appendChild(renderer.domElement);
  function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render)
  }
  render();
}
