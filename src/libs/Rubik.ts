import { AmbientLight, BoxGeometry, Camera, Mesh, MeshLambertMaterial } from 'three';
// var THREE = require('three') // require peer dependency
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// // var initializeDomEvents = require('threex.domevents')
// import { DomEvent as THREExDomEvent } from './threex.domevent'
// import initializeDomEvents from 'threex.domevents';
// var THREEx = {}
// initializeDomEvents(THREE, THREEx)
function Rubik(el: HTMLElement, dimensions: number = 3, backgroundColor?: Color) {

  backgroundColor = backgroundColor || new Color(0x303030);
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  // 初始化场景
  const scene = new Scene();
  const camera: Camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
  const renderer = new WebGLRenderer({
    antialias: true
  });

  renderer.setClearColor(backgroundColor, 1.0);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  el.append(renderer.domElement);

  camera.position.set(-20, 20, 30);

  camera.lookAt(scene.position);
  // 处理事件

  scene.add(new AmbientLight(0xffffff));

  // const orbitControl = new OrbitControls(camera, renderer.domElement);

  const colours = [0xC41E3A, 0x009E60, 0x0051BA, 0xFF5800, 0xFFD500, 0xFFFFFF];

  const faceMaterials = colours.map((color) => {
    // const c: MeshLambertMaterialParameters
    return new MeshLambertMaterial({ color })
  })

  // const cubeMaterials = new MeshFaceMaterial(faceMaterials)
  const cubeSize = 3, spacing = 0.5;

  const increment = cubeSize + spacing;
  const maxExtent = (cubeSize * dimensions + spacing * (dimensions - 1)) / 2;
  const allCubes: Mesh[] = [];

  function createCubeStep(x: number, y: number, z: number) {
    const geometry = new BoxGeometry(cubeSize, cubeSize, cubeSize);

    const cube = new Mesh(geometry, [...faceMaterials]);

    cube.castShadow = true;
    cube.position.set(x, y, z);
    // TODO: 
    // cube.rubikPosition = cube.position.clone();

    scene.add(cube);
    allCubes.push(cube);

  }


  const positionOffset = (dimensions - 1) / 2;

  for (let i = 0; i < dimensions; i++) {
    for (let j = 0; j < dimensions; j++) {
      for (let k = 0; k < dimensions; k++) {
        const x = (i - positionOffset) * increment;
        const y = (j - positionOffset) * increment;
        const z = (k - positionOffset) * increment;

        createCubeStep(x, y, z);
      }
    }
  }



  function render() {
    // if (isMoving) {}

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();


}


export default Rubik;
// export { Rubik };



