import { AmbientLight, AxesHelper, Box3, BoxGeometry, BufferAttribute, Color, Group, Mesh, MeshLambertMaterial, MOUSE, Object3D, PerspectiveCamera, Raycaster, Scene, Texture, TextureLoader, Vector2, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';



// 将鼠标坐标，变换至webgl 坐标
function canvasToWebglCoord(x: number, y: number, width: number, height: number) {
  const _x = (x / width) * 2 - 1;
  const _y = 1 - (y/height) * 2;

  return [_x, _y];
}

const textureLoader = new TextureLoader();


function loader(url: string) {
  return textureLoader.loadAsync(url)
}


const raycaster = new Raycaster();



class CubeMesh extends Mesh {
  rubikPosition: Vector3;
}
type Axis = 'x' | 'y' | 'z';
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

  interface Task {
    cube: CubeMesh;
    vector: Vector3;
    rotateAxis: Axis;
    direction: number;
  }

  class SceneUtils {
    static attach(child: CubeMesh, scene: Group, parent: Group) {
      const parentMatrixWorld = parent.matrixWorld.clone();
      parentMatrixWorld.invert();
      child.applyMatrix4(parentMatrixWorld);
      scene.remove(child);
      parent.add(child);
    }
    static detach(child: CubeMesh, scene: Group, parent: Group) {
      child.applyMatrix4(parent.matrixWorld);
      parent.remove(child);
      scene.add(child);
    }
  }



export async function RubikCube(el: HTMLElement, dimensions: number = 3, urls: string[], backgroundColor?: Color) {
  backgroundColor = backgroundColor || new Color(0x303030);
  const axesHelper = new AxesHelper( 5 );
  const domRect = el.getBoundingClientRect();
  const width = domRect.width;
  const height = domRect.height;


  const cubeGroup = new Group();
  // 初始化场景
  const scene = new Scene();
  const camera: PerspectiveCamera = new PerspectiveCamera(45, width / height, 0.1, 1000);
  const renderer = new WebGLRenderer({
    antialias: true
  });
  const pivot: Group = new Group();
  renderer.setClearColor(backgroundColor, 1.0);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  el.append(renderer.domElement);


  camera.position.set(-20, 20, 30);

  camera.lookAt(scene.position);
  // 处理事件

  scene.add(new AmbientLight(0xffffff));

  scene.add(axesHelper);
  const loaders = urls.map((url: string) => loader(url));
  const textures: Texture[] = await Promise.all(loaders);

  const faceMaterials = textures.map((texture: Texture) => {
    const material = new MeshLambertMaterial({
      map: texture
    })
    return material;
  });
  const moveQueue: Task[] = [];
  // const cubeMaterials = new MeshFaceMaterial(faceMaterials)
  const cubeSize = 3, spacing = 0.05;

  const increment = cubeSize + spacing;
  const maxExtent = (cubeSize * dimensions + spacing * (dimensions - 1)) / 2;
  const allCubes: CubeMesh[] = [];
  const uvRebuild = createUVBuilder(dimensions);
  const rotationSpeed = 0.2;
  let bigBoundingBox: Box3 = new Box3();
  function createCubeStep(x: number, y: number, z: number, xIndex: number, yIndex: number, zIndex: number) {
    const geometry = new BoxGeometry(cubeSize, cubeSize, cubeSize);

    const uvs = uvRebuild(xIndex, yIndex, zIndex);
    (geometry.attributes.uv as BufferAttribute).copyArray(uvs);
    const cube = new CubeMesh(geometry, [...faceMaterials]);

    cube.castShadow = true;
    cube.position.set(x, y, z);
    // TODO: 
    cube.rubikPosition = cube.position.clone();
    // object.target = cube;
    // const object = new Object3D(cube);
    // threexDomEvent.bind(object, 'mousedown', function (e: ThreexDomEventType) {
    //   // console.log("🚀 ~ file: R.ts:60 ~ e", e)
    //   onCubeMouseDown(e, cube);
    // })
    // threexDomEvent.bind(object, 'mouseup', function (e: MouseEvent) {
    //   // console.log("🚀 ~ file: R.ts:63 ~ e", e)
    //   onCubeMouseUp(e, cube);
    // })
    // threexDomEvent.bind(object, 'mouseout', function (e: ThreexDomEventType) {
    //   console.log("🚀 ~ file: R.ts:66 ~ e", e)
    //   onCubeMouseOut(e, cube);
    // })
    cubeGroup.add(cube);
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
          createCubeStep(x, y, z, i, j, k);
        }
      }
    }
  }

  createCubes();

  scene.add(cubeGroup);
  // new TrackballControls(camera, renderer.domElement) 
  const control = new TrackballControls(camera, renderer.domElement)
  control.mouseButtons = {
    LEFT: MOUSE.PAN,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.ROTATE
  }
  control.noPan = true;
  control.rotateSpeed = 5;
  let clickFace: Axis = 'x';
  let clickVectorStart: Vector3 | null;

  const handleMouseDown = (ev: MouseEvent) => {

    if (ev.button !== MOUSE.LEFT) {
      console.log("🚀 ~ handleMouseDown ~ ev.button:", ev.button, MOUSE.LEFT)
      return;
    }
    const intersect = getIntersectObject(ev, camera);
    if (intersect) {
      toggleControl(false);
      const point = intersect.point;
      const object = intersect.object as CubeMesh;

      if (nearlyEqual(Math.abs(point.x), maxExtent)) {
        clickFace = 'x';
      } else  if (nearlyEqual(Math.abs(point.y), maxExtent)) {
        clickFace = 'y';
      } else if (nearlyEqual(Math.abs(point.z), maxExtent)) {
        clickFace = 'z';
      }
      // 点击第一个点
      clickVectorStart = object.rubikPosition.clone();
    }
  }


  const handleMouseUp = (ev: MouseEvent) => {

    if (clickVectorStart) {
      const intersect = getIntersectObject(ev, camera);
      if (intersect) {
        const point = intersect.point;
        const object = intersect.object as CubeMesh;
        const clickVectorEnd = object.rubikPosition.clone();

        clickVectorEnd.sub(clickVectorStart);
        if (clickVectorEnd.length() > cubeSize) {
          const axesVector = clickVectorEnd.clone();

          axesVector[clickFace] = 0;

          const moveAxis = principalComponent(axesVector);
          // 确定旋转轴
          const rotateAxis = transitions[clickFace][moveAxis];
          let direction = clickVectorEnd[moveAxis] >= 0 ? 1 : -1;

          if (clickFace == 'z' && rotateAxis == 'x' ||
            clickFace == 'x' && rotateAxis == 'z' ||
            clickFace == 'y' && rotateAxis == 'z') {
            direction *= -1;
          }

          if (clickFace == 'x' && clickVectorStart.x > 0 ||
            clickFace == 'y' && clickVectorStart.y < 0 ||
            clickFace == 'z' && clickVectorStart.z < 0) 
          {
            direction *= -1;
          }
          queueMove(object, clickVectorStart.clone(), rotateAxis, direction);
          startNextMove();
        }
        // 点击第一个点
        clickVectorStart = object.rubikPosition.clone();
      } else {
        toggleControl(true);
      }
    }
  }

  el.addEventListener('mousedown', (ev: MouseEvent) => {
    console.log("🚀 ~ RubikCube ~ ev:", ev)
    
    handleMouseDown(ev);
  })

  el.addEventListener('mouseup', (ev: MouseEvent) => {
    handleMouseUp(ev);
  })
  function queueMove(cube: CubeMesh, v: Vector3, rotateAxis: Axis, direction: number) {
    moveQueue.push({
      cube,
      vector: v,
      rotateAxis,
      direction
    })
  }
  function principalComponent(v: Vector3): Axis {
    const y = Math.abs(v.y);
    const x = Math.abs(v.x);
    const z = Math.abs(v.z);
    let maxAxis: Axis = 'x', max = x;

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
  let activeGroup: CubeMesh[] = [];
  let isMoving = false;
  let currentMovingTask: Task;
  const rotation: { axis?: Axis, dir?: number } = {}
  function startNextMove() {
    const next = moveQueue.pop();
    if (next) {
      clickVectorStart = next.vector;
      const direction = next.direction || 1;
      // 旋转轴
      const rotateAxis = next.rotateAxis;

      if (clickVectorStart) {
        if (!isMoving) {
          isMoving = true;
          setActiveGroup(rotateAxis);
          pivot.rotation.set(0, 0, 0);
          pivot.updateWorldMatrix(false, true);
          scene.add(pivot);
          rotation.axis = rotateAxis;
          rotation.dir = direction;
          activeGroup.forEach(cube => {
            SceneUtils.attach(cube, cubeGroup, pivot);
          });
          currentMovingTask = next;
        } else {
          console.log('---------------- MOVING -----------------');
        }
      } else {
        console.log('---------------- NOTHING TO MOVE -----------------');
      }
    } else {
      // moveEvents.emit('deplete');
    }
  }
  function setActiveGroup(axis: Axis) {
    if (clickVectorStart) {
      activeGroup = [];
      allCubes.forEach((cube: CubeMesh) => {
        if (clickVectorStart) {
          // 找到跟点击的这个块 旋转轴值相同的块
          if (nearlyEqual(cube.rubikPosition[axis], clickVectorStart[axis])) {
            activeGroup.push(cube);
          }
        }
      })
    }
  }
  function doWork() {
    if (rotation.axis && rotation.dir) {
      pivot.rotation
      if (pivot.rotation[rotation.axis] >= Math.PI / 2) {
        pivot.rotation[rotation.axis] = Math.PI / 2;
        moveCompleted();
      } else if (pivot.rotation[rotation.axis] <= Math.PI / -2) {
        pivot.rotation[rotation.axis] = Math.PI / -2;
        moveCompleted();
      } else {
        pivot.rotation[rotation.axis] += (rotation.dir * rotationSpeed);
      }
    }
  }


  function moveCompleted() {
    isMoving = false;
    rotation.axis = undefined;
    rotation.dir = undefined;
    clickVectorStart = null;
    pivot.updateMatrixWorld();
    scene.remove(pivot);

    activeGroup.forEach(cube => {
      cube.updateMatrixWorld();
      cube.rubikPosition = cube.position.clone();
      cube.rubikPosition.applyMatrix4(pivot.matrixWorld);
      SceneUtils.detach(cube, cubeGroup, pivot);
    })
    toggleControl(true);
    // completedMoveStack.push(currentMovingTask);
    // moveEvents.emit('complete');
    startNextMove();

  }
  function getIntersectObject(ev: MouseEvent, camera: PerspectiveCamera) {
    const [cx, cy] = getWebglCoords(ev.clientX, ev.clientY);
    raycaster.setFromCamera(new Vector2(cx, cy), camera);

    const intersects = raycaster.intersectObject(cubeGroup);
    console.log("🚀 ~ handleMouseDown ~ intersects:", intersects);
    const intersect = intersects[0];
    // const point = intersect.point;
    // const object = intersect.object as CubeMesh;

    return intersect;
  }
  // 生成随机数
  /*** Util ***/
  function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  function shuffle() {
    const axis: Axis[] = ['x', 'y', 'z'];
    function randomAxis(): Axis {
      return axis[randomInt(0,2)];
    }

    function randomDirection() {
      var x = randomInt(0,1);
      if(x == 0) x = -1;
      return x;
    }

    function randomCube() {
      var i = randomInt(0, allCubes.length - 1);
      //TODO: don't return a centre cube
      return allCubes[i];
    }

    var nMoves = randomInt(10, 40);
    for(var i = 0; i < nMoves; i ++) {
      //TODO: don't reselect the same axis?
      var cube = randomCube();
      queueMove(cube, cube.position.clone(), randomAxis(), randomDirection());
    }
    startNextMove();
  }
  function getWebglCoords(clientX: number, clientY: number) {
    // const { clientX, clientY } = ev;
    const { left, top, width, height } = domRect;
    const x = clientX - left;
    const y = clientY - top;

    return canvasToWebglCoord(x, y, width, height);
  }

  function toggleControl(enabled: boolean) {
    control.enabled = enabled;
  }

  function render() {
    if (isMoving) {
      doWork();
    }
    control.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  return {
    shuffle
  }

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

function createUVBuilder(dimensions: number) {
  return function uvRebuild(x: number, y: number, z: number): number[] {
    let d = dimensions - 1;
    let k = 1 / dimensions;
    let right: number[] = [
      (d - z) * k, (y + 1) * k,
      (d - z + 1) * k, (y+1) *k,
      (d-z) *k, y*k,
      (d-z+1)*k, y*k
    ];
    let left: number[] = [
      z*k,(y+1)*k,
      (z+1)*k, (y+1)*k,
      z*k, y*k,
      (z+1)*k, y*k
    ];
    let top: number[] = [
      x*k,(d-z+1)*k,
      (x+1)*k, (d-z+1)*k,
      x*k,(d-z)*k,
      (x+1)*k,(d-z)*k
    ];
    let bottom: number[] = [
      x*k,(z+1)*k,
      (x+1)*k,(z+1)*k,
      x*k, z*k,
      (x+1)*k,z*k
    ];
    let front: number[] = [
      x*k,(y+1)*k,
      (x+1)*k,(y+1)*k,
      x*k,y*k,
      (x+1)*k, y*k
    ];
    let back: number[] = [
      (d-x)*k,(y+1)*k,
      (d-x+1)*k,(y+1)*k,
      (d-x)*k,y*k,
      (d-x+1)*k,y*k
    ];
  
    return [
      ...right,
      ...left,
      ...top,
      ...bottom,
      ...front,
      ...back
    ]
  }
}


