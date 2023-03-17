<template>
  <div class="session5" ref="session5"></div>
</template>

<script lang="ts">
import { Ref, ref, defineComponent, onMounted } from 'vue';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Camera, Clock, Mesh, PerspectiveCamera, Scene, WebGLRenderer, Vector3 } from 'three';
// import cloud from 'assets/cloud.png';
const cloud = new URL(`/src/assets/cloud.png`, import.meta.url).href

const vShader = `
        varying vec2 vUv;
        void main()
        {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `;
      const fShader = `
        uniform sampler2D map;
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        varying vec2 vUv;
        void main()
        {
          float depth = gl_FragCoord.z / gl_FragCoord.w;
          float fogFactor = smoothstep( fogNear, fogFar, depth );
          gl_FragColor = texture2D(map, vUv );
          gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );
          gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
        }
      `;
export default defineComponent({
  name: 'session5',
  components: {},
  props: {},
  setup(props) {
    const session5: Ref<HTMLElement | null> = ref(null);
    const StartTime = Date.now();
    let camera: PerspectiveCamera;
    let scene: Scene;
    let renderer: WebGLRenderer;
    let mesh: Mesh;
    let mouseX: number = 0;
    let mouseY: number = 0;
    let windowHalfX: number = window.innerWidth / 2;
    let windowHalfY: number = window.innerHeight / 2;
    let target: Vector3 = new Vector3();
    // 云的个数
    const CloudCount = 8000;
    // 每个云所占z轴的长度
    const perCloudZ = 1;
    // 所有的云一共的Z轴长度
    const cameraPositionZ = CloudCount * perCloudZ;
    // const cameraPositionZ = CloudCount;
    // X轴和Y轴平移的随机参数
    const RandomPositionX = 600;
    const RandomPositionY = 250;
    // 背景色，目前为天蓝色
    const BackGroundColor = '#1e4877';
    function init() {
      const pageWidth = session5.value?.clientWidth as number;
      const pageHeight = session5.value?.clientHeight as number;
      // 透视相机，只有距离相机1~500的物体才可以被渲染
      camera = new THREE.PerspectiveCamera(30, pageWidth / pageHeight, 1, 3000);
      // 相机的位置，平移下左右平衡
      // camera.position.x = Math.floor(RandomPositionX / 2);
      // 最初在最远处
      camera.position.x = Math.floor(RandomPositionX / 2);
      camera.position.z = cameraPositionZ;
      camera.position.y = Math.floor(RandomPositionY / 10);
      // camera.position.set(20, 30, 6000)
      const axesHelper = new THREE.AxesHelper(500);
      // axesHelper.position.z = 7000
      // 线性雾，就是说雾化效果是随着距离线性增大的
      // 可以改变雾的颜色，发现远处的云的颜色有所变化
      const fog = new THREE.Fog(0x4584b4, -100, 3000);
      scene = new THREE.Scene();
      scene.background = new THREE.Color(BackGroundColor);
      const texture = new THREE.TextureLoader().load(cloud);
      // texture.magFilter = THREE.LinearMipMapLinearFilter;
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      // 贴图材质
      const material = new THREE.ShaderMaterial({
        // 这里的值是给着色器传递的
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
        vertexShader: vShader,
        fragmentShader: fShader,
        transparent: true
      });

      // 一个平面形状
      const geometry = new THREE.PlaneGeometry(64, 64);
      const geometries = [];
      // for (let i = 0; i < CloudCount; i++) {
      //   const plane = geometry.clone() // 克隆
      //   plane.translate(Math.random() * RandomPositionX, -Math.random() * RandomPositionY, i * perCloudZ)
      //   geometries.push(plane);
      // }

      for (var i = 0; i < CloudCount; i++) {
        const plane = geometry.clone() // 克隆
        const x = Math.random() * RandomPositionX;
        const y = -Math.random() * RandomPositionY;
        const z = i;
        const rotationZ = Math.random() * Math.PI;
        const scaleX = Math.random() * Math.random() * 1.5 + 0.5;
        const scaleY = scaleX;
        // geometry.position.set()
        plane.rotateZ(rotationZ);
        plane.scale(scaleX, scaleY, 1);
        plane.translate(x, y, z);
        // 把这个克隆出来的云，通过随机参数，做一些位移，达到一堆云彩的效果，每次渲染出来的云堆都不一样
        // X轴偏移后，通过调整相机位置达到平衡
        // Y轴想把云彩放在场景的偏下位置，所以都是负值
        // Z轴位移就是：当前第几个云*每个云所占的Z轴长度
        geometries.push(plane);
      }
      // 把一组图形合并一个
      const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
      // 把上面合并出来的形状和材质，生成一个物体
      mesh = new THREE.Mesh(mergedGeometry, material);
      // target.copy(scene.position);
      // 添加进场景
      scene.add(mesh);
      // mesh = new THREE.Mesh(geometry, material);
      // mesh.position.z = -8000;
      // scene.add(mesh);
      scene.add(axesHelper)
      // camera.lookAt(axesHelper.position);
      renderer = new THREE.WebGLRenderer({ antialias: false });
      renderer.setSize(pageWidth, pageHeight);

      session5.value!.appendChild(renderer.domElement);
      // document.addEventListener('mousemove', onDocumentMouseMove, false);
      window.addEventListener('resize', onWindowResize, false)
    }
    // function onDocumentMouseMove(event: MouseEvent) {
    //   mouseX = (event.clientX - windowHalfX) * 0.25;
    //   mouseY = (event.clientY - windowHalfY) * 0.15
    // }

    function onWindowResize(event: any) {
      camera.aspect = window.innerWidth / window.innerHeight;
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    const clock = new Clock();
    clock.start();
    function animate() {
      // const time = clock.getElapsedTime()
      // console.log("🚀 ~ file: Cloud.vue:170 ~ animate ~ time:", time)
      let position = ((Date.now() - StartTime) * 0.05) % cameraPositionZ;
      // camera.position.x += (mouseX - target.x) * 0.01;
      // camera.position.y += (-mouseY - target.y) * 0.01;
      camera.position.z = cameraPositionZ - position;
      // target.x = camera.position.x;
      // target.y = camera.position.y;
      // target.z = camera.position.z - 1000;
      // camera.position.z = cameraPositionZ - (clock.getDelta() * 1000 * 0.03) % cameraPositionZ;
      // camera.position.z = -cameraPositionZ + 8000;
      // 从最远的z轴处开始往前一点一点的移动，达到穿越云层的目的
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    function updatePosition() {
      camera.position.x += (mouseX - target.x) * 0.01;
      camera.position.y += (-mouseY - target.y) * 0.01;
      target.x = camera.position.x;
      target.y = camera.position.y;
      target.z = camera.position.z - 1000;
    }

    onMounted(() => {
      init();
      animate();
    });
    return { session5 };
  }
});
</script>

<style lang="scss">
.session5 {
  display: flex;
  width: 100vw;
  height: 100vh;
  flex-shrink: 0;
  background-image: linear-gradient(rgb(200, 240, 255), rgb(219, 255, 241));
}
</style>
