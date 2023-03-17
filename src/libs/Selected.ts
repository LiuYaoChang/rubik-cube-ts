import { MeshBasicMaterial, PlaneGeometry, Raycaster } from 'three';
import { Face, SphereGeometry } from 'three';
import THREE, { Plane, Ray, Vector3, Scene, AxesHelper, BufferGeometry, BufferAttribute, MeshLambertMaterial, DoubleSide, Mesh, PointLight, PerspectiveCamera, WebGLRenderer, LineBasicMaterial, Line, BoxGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

  // 视点
  const E = new Vector3(0, 12, 16);
  // 鼠标点
  const P = new Vector3(7, 3, 4);

  const A = new Vector3(-6, 6, -4);
  const B = new Vector3(0, 0, 4);
  const C = new Vector3(6, 6, -4);
  // 射线方向
  const V = new Vector3().subVectors(P, E).normalize();

  // 叉积 向量确定平面法向量
  const AB = new Vector3().subVectors(B, A);
  const BC = new Vector3().subVectors(C, B);
  const N = new Vector3().crossVectors(AB, BC);
export function Select() {
  // A, B, C 确定一个面

  // const A = new Vector3(-6, 0, -4);
  // const B = new Vector3(0, 0, 4);
  // const C = new Vector3(6, 0, -4);
  // const A = new Vector3(-6, 6, -4);
  // const B = new Vector3(0, 0, 4);
  // const C = new Vector3(6, 6, -4);

  // 视点
  // const E = new Vector3(0, 12, 16);
  // 鼠标点
  // const P = new Vector3(7, 3, 4);
  // const P = new Vector3(7, 0, 6);

  // 求平面交点M，
  // 1. MA.N = 0(1)
  // EM = λV => (M - E) = λV => M = λV + E(2); 将M 代入(1)得 (A -(λV+E)).N=0 λV.N = (A-E).N => λ = (A-E).N/V.N
  // M = V*((A-E).N/V.N) + E
  // 将上式代入求M
  const M = V.clone().multiplyScalar(
    new Vector3().subVectors(A, E).dot(N) / V.clone().dot(N)
  ).add(E);

  console.log(
    M.x.toFixed(5),
    M.y.toFixed(5),
    M.z.toFixed(5),
  )

  // 不共线三点创建一个平面
  const plane = new Plane().setFromCoplanarPoints(A,B,C);

  // 射线
  const ray = new Ray(E, V);
  const MT = new Vector3();

  ray.intersectPlane(plane, MT);

  console.log('target ----------------- MT ----------', MT)
  const inside = isInTriangle(M, [A, B, C]);
  console.log("🚀 ~ file: Selected.ts:53 ~ Select ~ inside:--------------------", inside)
  const pass = inTriangle(M, [A, B, C])
  console.log("🚀 ~ file: Selected.ts:56 ~ Select ~ pass:-------------------", pass)
  // 是否在三角形中
  function inTriangle(M: Vector3, triangle: Vector3[]) {
    let bool = true
    for (let i = 0; i < 3; i++) {
        const j = (i + 1) % 3
        const [A, B] = [triangle[i], triangle[j]]
        const MA = A.clone().sub(M)
        const AB = B.clone().sub(A)
        const d = MA.clone().cross(AB)
        const len = d.dot(N)
        if (len < 0) {
            bool = false
            break
        }
    }
    return bool
  }
  function sameSide(A: Vector3, B: Vector3, C: Vector3, P: Vector3) {
    const AB = B.clone().sub(A);
    const AC = C.clone().sub(A);
    const N = AB.clone().cross(AC);
    const AP = P.clone().sub(A);
    const Q = AB.clone().cross(AP);
    const inside = Q.dot(N);
    // 同向就在三角形内
    return inside > 0;

  }
  function isInTriangle(P: Vector3, [ A, B, C ]: Vector3[]) {
    return sameSide(A, B, C, P) &&
    sameSide(B, C, A, P) &&
    sameSide(C, A, B, P)
  }
}

const raycaster = new Raycaster();
export function draw(el: HTMLElement) {

  const width = el.clientWidth;
  const height = el.clientHeight;
  const scene = new Scene();
  const axes = new AxesHelper(300);
  scene.add(axes);
  // 画射线

  const lineGeometry = new BufferGeometry();
  const lineMaterial = new LineBasicMaterial({
    color: 0xff00ff
  })

  const lineVerttexs = new Float32Array([
    ...P.toArray(),
    ...E.toArray()
  ])
  const geometry = new BufferGeometry();


  const points = new Float32Array([
    ...A.toArray(),
    ...B.toArray(),
    ...C.toArray()
  ])

  lineGeometry.attributes.position = new BufferAttribute(lineVerttexs, 3);
  geometry.attributes.position = new BufferAttribute(points, 3);

  const planematerial = new MeshLambertMaterial({
    color: 0xfff,
    side: DoubleSide
  });
  const material = new MeshLambertMaterial({
    color: 0x00ffff,
    side: DoubleSide
  });
  const xm = new MeshBasicMaterial({
    color: 0xf56c6c,
    side: DoubleSide
  });
  // 添加一个平台
  const planeGeometry = new PlaneGeometry(100, 100);
  const line = new Line(lineGeometry, lineMaterial);
  const mesh = new Mesh(geometry, material);
  const sphereGeometry = new SphereGeometry(0.1);
  const xsphereg = new SphereGeometry(0.1);
  const plane = new Mesh(planeGeometry, planematerial);
  const eyeBall = new Mesh(sphereGeometry, material);
  const xdot = new Mesh(xsphereg, xm);
  eyeBall.position.set(E.x, E.y, E.z);
  xdot.position.set(10, 0, 0);

  scene.add(line);
  scene.add(eyeBall);
  // scene.add(mesh);
  scene.add(xdot);

  const pointLight = new PointLight(0xffffff);
  pointLight.position.set(300, 200, 300);

  const camera = new PerspectiveCamera(45, 2, 0.1, 1000);

  camera.position.set(E.x, E.y, E.z);

  camera.lookAt(scene.position);
  const renderer = new WebGLRenderer({
    antialias: true
  })

  renderer.setSize(width, height);
  renderer.setClearColor(0xb9d3ff, 1);
  const control = new OrbitControls(camera, renderer.domElement);

  el.appendChild(renderer.domElement)

  el.addEventListener("click", (ev: MouseEvent) => {
    const [x, y] = toWebglCoord(ev);
    const P = new Vector3(x, y);
    raycaster.setFromCamera(P, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      console.log("🚀 ~ file: Selected.ts:170 ~ el.addEventListener ~ P:", P)
      const lineVerttexs = new Float32Array([
        ...E.toArray(),
        ...point.toArray()
      ])
      lineGeometry.attributes.position = new BufferAttribute(lineVerttexs, 3);
    }

  })

  function render() {


    renderer.render(scene, camera);
    requestAnimationFrame(render)
  }


  render();


}

const toWebglCoord = (ev: MouseEvent) => {
  const el = ev.target as HTMLCanvasElement;
  const rect = el.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  const width = el.width, height = el.height;

  const wx = (x / width) * 2 - 1;
  const wy = -(y / width) * 2 + 1;

  return [wx, wy];

}

// 方块
export function crateCube(el: HTMLElement) {
  
  const width = el.clientWidth;
  const height = el.clientHeight;
  const scene = new Scene();
  const axes = new AxesHelper(300);
  scene.add(axes);
  // 画射线

  const geometry = new BoxGeometry(5, 5, 5);

  const material = new MeshLambertMaterial({
    color: 0x00ffff,
    side: DoubleSide
  });
  const cube = new Mesh(geometry, material);

  scene.add(cube);

  const pointLight = new PointLight(0xffffff);
  pointLight.position.set(300, 200, 300);

  const camera = new PerspectiveCamera(45, 2, 0.1, 200);

  camera.position.set(10, 20, 20);

  camera.lookAt(scene.position);
  const renderer = new WebGLRenderer({
    antialias: true
  })

  renderer.setSize(width, height);
  renderer.setClearColor(0xb9d3ff, 1);
  const control = new OrbitControls(camera, renderer.domElement);
  el.appendChild(renderer.domElement)
  
  el.addEventListener('click', (event: MouseEvent) => {
    const x = (event.clientX / width) * 2 - 1;
    const y = -(event.clientY / height) * 2 + 1;
    const v = new Vector3(x, y, 1);
    v.sub(camera.position).normalize();
    const raycaster = new Raycaster(camera.position, v);

    const intersects = raycaster.intersectObject(cube);
    const target = intersects[0];
    const geometry = (intersects[0].object as Mesh).geometry
    geometry.computeBoundingBox();
    const centroid = new Vector3();
    // 顶点索引
    const { a, b, c } = target.face as Face;
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
    console.log("🚀 ~ file: Selected.ts:219 ~ el.addEventListener ~ intersects:", centroid)
  })

  function render() {


    renderer.render(scene, camera);

    requestAnimationFrame(render)
  }


  render();


}

