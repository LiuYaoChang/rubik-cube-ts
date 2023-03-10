
import {
  Object3D as THREEObject3D,
  Vector3,
  Raycaster,
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AmbientLight,
  BoxGeometry,
  Camera,
  MeshLambertMaterial,
  Matrix4
} from 'three';

// import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export const r: number = 1;
import { THREExDomEvent } from './Threex_Domevent';
import { create, Mesh, Object3D } from './Mesh';
import { ThreexDomEventType } from './threex.domevent';

type Axis = 'x' | 'y' | 'z';
type Action = {
  cube: Mesh,
  vector: Vector3,
  axis: Axis,
  direction: number;
}

class SceneUtils {
  static attach(child: Mesh, scene: Scene, parent: THREEObject3D) {
    const parentMatrixWorld = parent.matrixWorld.clone();
    parentMatrixWorld.invert();
    child.applyMatrix4(parentMatrixWorld);
    scene.remove(child);
    parent.add(child);
  }
  static detach(child: Mesh, scene: Scene, parent: THREEObject3D) {
    child.applyMatrix4(parent.matrixWorld);
    parent.remove(child);
    scene.add(child);
  }
}


export function Rubik(el: HTMLElement, dimensions: number = 3, backgroundColor?: Color) {
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
  let lastCube: Mesh; // 最后一个块
  const threexDomEvent = new THREExDomEvent(camera);
  const orbitControl = new OrbitControls(camera, renderer.domElement);

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
    cube.rubikPosition = cube.position.clone();
    // object.target = cube;
    const object = new Object3D(cube);
    threexDomEvent.bind(object, 'mousedown', function (e: ThreexDomEventType) {
      console.log("🚀 ~ file: R.ts:60 ~ e", e)
      onCubeMouseDown(e, cube);
    })
    threexDomEvent.bind(object, 'mouseup', function (e: MouseEvent) {
      console.log("🚀 ~ file: R.ts:63 ~ e", e)
      onCubeMouseUp(e, cube);
    })
    threexDomEvent.bind(object, 'mouseout', function (e: ThreexDomEventType) {
      console.log("🚀 ~ file: R.ts:66 ~ e", e)
      onCubeMouseOut(e, cube);
    })

    scene.add(cube);
    allCubes.push(cube);

  }

  function createCubes() {
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
  }

  function enabledConTrol() {
    orbitControl.enabled = true;
  }
  function disabledConTrol() {
    orbitControl.enabled = false;
  }
  let clickVector: Vector3 | undefined;
  let clickFace: 'x' | 'y' | 'z';
  let isMoving = false;


  function principalComponent(v: Vector3) {
    const y = Math.abs(v.y);
    const x = Math.abs(v.x);
    const z = Math.abs(v.z);
    let maxAxis = 'x', max = x;

    if (y > max) {
      maxAxis = 'y';
      max = y
    }
    if (z > max) {
      maxAxis = 'z';
      max = z;
    }
    return maxAxis;
  }
    //Matrix of the axis that we should rotate for 
  // each face-drag action
  //    F a c e
  // D    X Y Z
  // r  X - Z Y
  // a  Y Z - X
  // g  Z Y X -
  var transitions: any = {
    'x': {'y': 'z', 'z': 'y'},
    'y': {'x': 'z', 'z': 'x'},
    'z': {'x': 'y', 'y': 'x'}
  }

  /**
   * 1. 鼠标按下，暂停相机控制
   * 2. 记录当前点击的方块的位置向量
   * @param event 
   * @param cube 
   */
  function onCubeMouseDown(event: ThreexDomEventType, cube: Mesh) {
    disabledConTrol();
    if (!isMoving) {
      clickVector = cube.rubikPosition.clone();
      const geometry = cube.geometry;
      geometry.computeBoundingBox();
      const centroid = new Vector3();
      // 顶点索引
      const { a, b, c } = event.targetFace;
      // 顶点
      const verticesBuffer = geometry.attributes.position.array;
      const vertices: Vector3[] = [];

      for (let i = 0; i < verticesBuffer.length; i+= 3) {
        vertices.push(new Vector3(verticesBuffer[i], verticesBuffer[i+1], verticesBuffer[i+2]));
      }
      centroid.add(vertices[a]);
      centroid.add(vertices[b]);
      centroid.add(vertices[c]);
      centroid.divideScalar(3);
      centroid.applyMatrix4(cube.matrixWorld);

      if (nearlyEqual(Math.abs(centroid.x), maxExtent)) {
        clickFace = 'x';
      } else  if (nearlyEqual(Math.abs(centroid.y), maxExtent)) {
        clickFace = 'y';
      } else if (nearlyEqual(Math.abs(centroid.z), maxExtent)) {
        clickFace = 'z';
      }
    }

  }

  function onCubeMouseUp(event: MouseEvent, cube: Mesh) {
    if (clickVector) {
      const dragVector = cube.rubikPosition.clone();
      dragVector.sub(clickVector);

      // 移动 超过1个方块
      if (dragVector.length() > cubeSize) {

        const axesVector = dragVector.clone();

        axesVector[clickFace] = 0;

        const maxAxis = principalComponent(axesVector) as Axis;
        const rotateAxis = transitions[clickFace][maxAxis];
        let direction = dragVector[maxAxis] >= 0 ? 1 : -1;

        if (clickFace == 'z' && rotateAxis == 'x' ||
          clickFace == 'x' && rotateAxis == 'z' ||
          clickFace == 'y' && rotateAxis == 'z') {
          direction *= -1;
        }

        if (clickFace == 'x' && clickVector.x > 0 ||
          clickFace == 'y' && clickVector.y < 0 ||
          clickFace == 'z' && clickVector.z < 0) {
          direction *= -1;
        }

        queueMove(cube, clickVector.clone(), rotateAxis, direction);
        runNextMove();
        enabledConTrol();

      }

    }
  }

  // 记录最后一个方块
  function onCubeMouseOut(event: ThreexDomEventType, cube: Mesh) {
    lastCube = cube;
  }
  const raycaster = new Raycaster();
  function isMouseOverCube(mx: number, my: number) {
    var x = ( mx / width ) * 2 - 1;
    var y = -( my / height ) * 2 + 1;
    const projectVector = new Vector3(x, y, 1);
    projectVector.unproject(camera);
    projectVector.sub(camera.position).normalize();
    raycaster.set(camera.position, projectVector);
    return raycaster.intersectObjects(allCubes, true).length > 0;
  }

  let activeGroup: Mesh[] = [];
  let moveAxis: Axis | undefined;
  let moveN: number | undefined;
  let moveDirection: number | undefined;
  let currentMovingTask: Action;
  const pivot = create();
  const rotationSpeed = 0.2;
  const moveQueue: Action[] = [];
  function queueMove(cube: Mesh, v: Vector3, axis: Axis, direction: number) {
    moveQueue.push({
      cube,
      vector: v,
      axis,
      direction
    })
  }


  function setActiveGroup(axis: Axis) {
    if (clickVector) {
      activeGroup = [];
      allCubes.forEach(cube => {
        if (clickVector) {
          if (nearlyEqual(cube.rubikPosition[axis], clickVector[axis])) {
            activeGroup.push(cube);
          }
        }
      })
    }
  }

  function runNextMove() {
    const next = moveQueue.pop();

    if (next) {
      clickVector = next.vector;
      const direction = next.direction || 1;
      const axis = next.axis;

      if (clickVector) {
        if (!isMoving) {
          isMoving = true;
          setActiveGroup(axis);
          pivot.rotation.set(0, 0, 0);
          pivot.updateWorldMatrix(false, true);
          scene.add(pivot);
          moveAxis = axis;
          moveDirection = direction;
          activeGroup.forEach(cube => {
            SceneUtils.attach(cube, scene, pivot);
          });
          currentMovingTask = next;
        } else {
          console.log('---------------- MOVING -----------------');
        }
      } else {
        console.log('---------------- NOTHING TO MOVE -----------------');
      }
    }
  }


  function doWork() {
    if (moveAxis && moveDirection) {
      if (pivot.rotation[moveAxis] >= Math.PI / 2) {
        pivot.rotation[moveAxis] = Math.PI / 2;
        moveCompleted();
      } else if (pivot.rotation[moveAxis] <= Math.PI / -2) {
        pivot.rotation[moveAxis] = Math.PI / -2;
        moveCompleted();
      } else {
        pivot.rotation[moveAxis] += (moveDirection * rotationSpeed);
      }
    }
  }


  function moveCompleted() {
    isMoving = false;
    moveAxis = moveDirection = moveN = undefined;
    clickVector = undefined;
    pivot.updateMatrixWorld();
    scene.remove(pivot);

    activeGroup.forEach(cube => {
      cube.updateMatrixWorld();
      cube.rubikPosition = cube.position.clone();
      cube.rubikPosition.applyMatrix4(pivot.matrixWorld);
      SceneUtils.detach(cube, scene, pivot);
    })

    runNextMove();

  }

  /**
   * 约等于
   * @param a 
   * @param b 
   * @param diff 
   */
  function nearlyEqual(a: number, b: number, diff: number = 0.001) {
    return Math.abs(a - b) <= diff;
  }

  /**
   * 当前操作组（face）
   * @param axis 
   */
  function setSelectedGroup(axis: Axis) {}


  function render() {
    if (isMoving) {
      doWork();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  // 生成cube
  createCubes();
  render();
  // 如果离开魔方
  el.addEventListener('mouseup', (e: MouseEvent) => {
    if (!isMouseOverCube(e.clientX, e.clientY)) {
      onCubeMouseUp(e, lastCube);
    }
  })
  // 返回一个闭包
  return {
    threexDomEvent
  };

}