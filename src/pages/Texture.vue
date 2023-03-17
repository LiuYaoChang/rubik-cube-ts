<template>
  <canvas ref="canvasRef" width="800" height="800"></canvas>
</template>

<script setup lang="ts">
import { GLBufferAttribute, Texture, WebGLRenderer } from 'three';
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import { getWebGLContext, initShaders } from '../libs/webgl/cuon-utils';
// import { useRoute, useRouter } from 'vue-router';
const img = new URL(`/src/assets/1.jpg`, import.meta.url).href;
const dog = new URL(`/src/assets/erha.jpg`, import.meta.url).href;
//console.log('1-开始创建组件-setup')
/**
* 数据部分
*/
type fn = (x: number, y: number) => void;
const data = reactive({})
const canvasRef = ref<HTMLCanvasElement>();
let render: fn | null | undefined;
onBeforeMount(() => {
  //console.log('2.组件挂载页面之前执行----onBeforeMount')
})
onMounted(() => {
  // click
  const canvas = canvasRef.value;
  if (canvas?.addEventListener) {
    canvas.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;
      const [x, y] = toWebglCoord(clientX, clientY, canvas);
      if (render) {
        render(x, y);
      }
    })
  }
  loadTexture(dog, (img: HTMLImageElement) => {
    console.log("🚀 ~ file: Texture.vue:20 ~ loadTexture ~ img:", img)
    // 加载 完成
    /**
     * 1. 图片比例
     * 
     * 
     * 
     * */
    const el = canvasRef.value as HTMLCanvasElement;
    const ratio = img.width / img.height;
    const width = el.width;
    const height = width / ratio;
    el.height = height;
    render = initContext(img);
    // const ratio = img.clientWidth
  })
  //console.log('3.-组件挂载到页面之后执行-------onMounted')
})

// canvas coord to webgl coord
const toWebglCoord = (clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
  const x = (clientX / canvas.width) * 2 - 1;
  const y = -(clientY / canvas.height) * 2 + 1;
  return [x, y];
}
const loadTexture = (src: string, callback: Function) => {
  const img = new Image();

  img.onload = () => {
    callback(img);
  }
  img.onerror = (event: any) => {
    console.log("🚀 ~ file: Texture.vue:33 ~ loadTexture ~ event:", event)
  }
  img.src = src;

}
const V_SHADER_SOURCE = `
attribute vec2 a_Coord;
attribute vec4 a_Position;
varying vec2 v_MapCoord;
void main() {
  gl_Position = a_Position;
  v_MapCoord = a_Coord;
}
`;
const F_SHADER_SOURCE = `

precision mediump float;

uniform sampler2D u_Map; 
varying vec2 v_MapCoord;

void main() {
  gl_FragColor = texture2D(u_Map, v_MapCoord);
}
`;
const initContext = (img: HTMLImageElement) => {
  const canvas = canvasRef.value as HTMLCanvasElement;
  const gl = getWebGLContext(canvas);

  if (gl !== null) {
    if (!initShaders(gl, V_SHADER_SOURCE, F_SHADER_SOURCE)) {
      return null;
    }

    const n = initVertexBuffers(gl);
    // 纹理
    initTexture(gl, img);
    //声明颜色 rgba
    //刷底色
    //绘制顶点
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  }

}

function initVertexBuffers(gl: WebGLRenderingContext) {
  // 顶点缓冲区, 绘制
  const vertices = new Float32Array([
    -1, 1, 0, 4,
    -1, -1, 0, 0,
    1, 1, 4, 4,
    1, -1, 4, 0
  ])
  const PER_SIZE = Float32Array.BYTES_PER_ELEMENT;
  const buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, PER_SIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);
  // 图钉的位置
  const a_Coord = gl.getAttribLocation(gl.program, 'a_Coord');
  gl.vertexAttribPointer(a_Coord, 2, gl.FLOAT, false, PER_SIZE * 4, PER_SIZE * 2);
  gl.enableVertexAttribArray(a_Coord);
  return vertices.length / 4;
}
function initTexture(gl: WebGLRenderingContext, img: HTMLImageElement) {
  const texture = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR
  )
  // 非2次幂图片
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_S,
    gl.MIRRORED_REPEAT
  )
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_T,
    gl.REPEAT
  )
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  const u_Map = gl.getUniformLocation(gl.program, 'u_Map');
  gl.uniform1i(u_Map, gl.TEXTURE0);
}

</script>
<style lang='scss'>
canvas {
  border: 1px solid red;
}
</style>