<template>
  <canvas ref="canvas" width="800" height="800"></canvas>
</template>

<script setup lang="ts">
import { Matrix4 } from '../lib/cuon-matrix'
import { Matrix4 as LMatrix4 } from '../lib/Matrix4';
import { Matrix4 as TMatrix4, PerspectiveCamera, Vector3 } from 'three';
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect } from 'vue';
import { initShader, initVertexBuffer } from '../libs/webgl/utils/share';

const canvas = ref<HTMLCanvasElement>();

const eyeRef = ref<Vector3>(new Vector3());
const indices = ref<Uint8Array>(new Uint8Array([
            0, 1, 2,   0, 2, 3,    // 前
            0, 3, 4,   0, 4, 5,    // 右
            0, 5, 6,   0, 6, 1,    // 上
            1, 6, 7,   1, 7, 2,    // 左
            7, 4, 3,   7, 3, 2,    // 下
            4, 7, 6,   4, 6, 5     // 后
        ]));
const vertices = ref<Float32Array>(new Float32Array([
            // 设置顶点和颜色（偷的顶点代码位置）
            1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
            -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
            -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
            1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
            1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
            1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
            -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
            -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
        ]));
/**
* 数据部分
*/
const data = reactive({})
onBeforeMount(() => {
  //console.log('2.组件挂载页面之前执行----onBeforeMount')
})
onMounted(() => {
  drawCube();
  bindEvent();
  //console.log('3.-组件挂载到页面之后执行-------onMounted')
})
// 给画面添加事件
const bindEvent = () => {
  const el = canvas.value as HTMLCanvasElement;
  el.addEventListener('click', (ev: MouseEvent) => {
    // 1. 转换成webgl 坐标
    // 2. 判定选中
    const [x, y] = toWebglCoord(ev);
    // 判断是否选中
    const hited = checkHitCube(eyeRef.value, x, y, indices.value, vertices.value);
    console.log("🚀 ~ file: Rotate.vue:55 ~ el.addEventListener ~ hited:", hited)
    console.log("🚀 ~ file: Rotate.vue:31 ~ el.addEventListener ~ y:", y)
    console.log("🚀 ~ file: Rotate.vue:31 ~ el.addEventListener ~ x:", x)
  })
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

const checkHitCube = (eye: Vector3, clientX: number, clientY: number, indices: Uint8Array, vertices: Float32Array) => {
  const E = new Vector3().copy(eye);
  // ray direction
  const V = new Vector3(clientX, clientY, 0).sub(E).normalize();

  // 3个顶点,一个三角形
  for (let i = 0; i < indices.length; i+=3) {
    const A = getPointVector(indices[i] * 6, vertices);
    const B = getPointVector(indices[i + 1] * 6, vertices);
    const C = getPointVector(indices[i+2] * 6, vertices);
    const P = getMetPoint(A, B, C, V, E);
    const hited = isInTriangel(A, B, C, P);
    if (hited) {
      return true;
    }
  }
}

const getMetPoint = (A: Vector3, B: Vector3, C: Vector3, V: Vector3, E: Vector3) => {
  const n = getPlanNormal(A, B, C);
  const M = new Vector3().copy(V).multiplyScalar((A.clone().sub(E).dot(n) / V.clone().dot(n))).add(E);
  return M
}
const getPlanNormal = (A: Vector3, B: Vector3, C: Vector3) => {
  const AB = B.clone().sub(A);
  const AC = C.clone().sub(A);
  const n = AB.clone().cross(AC);
  return n;
}
const isInTriangel = (A: Vector3, B: Vector3, C: Vector3, P: Vector3) => {
  return sameSide(A, B, C, P) &&
  sameSide(B, A, C, P) &&
  sameSide(C, A, B, P);
}
const sameSide = (A: Vector3, B: Vector3, C: Vector3, P: Vector3) => {
  const AB = B.clone().sub(A);
  const AC = C.clone().sub(A);
  const AP = P.clone().sub(A);
  const n = AB.clone().cross(AC);
  const V = AB.clone().cross(AP);
  return n.dot(V) > 0;
}
// get triangle vertice
const getPointVector = (index: number, vertices: Float32Array) => {
  return new Vector3(vertices.at(index), vertices.at(index + 1), vertices.at(index + 2))
}
const drawCube = () => {
    const fragSource = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
      gl_FragColor = v_Color;
    }
  `
  const vertexSource = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    uniform mat4 u_ModelViewMatrix;
    void main() {
      gl_Position = u_ModelViewMatrix * a_Position;
      v_Color = a_Color;
    }
  `;
  const el = canvas.value as HTMLCanvasElement;
    const gl = el.getContext('webgl');
    if (gl) {
      if (!initShader(gl, vertexSource, fragSource)) {
        return false;
        console.log("🚀 ~ file: App.vue:27 ~ init ~ vertexSource")
      }


      const PER_SIZE = Float32Array.BYTES_PER_ELEMENT;
      // 设置顶点缓存
      const n = initVertexBuffers(gl);
      if (n == -1) {
        return false;
      }

      // 设置视角矩阵的相关信息（视点，视线，上方向）
      const modeViewMatrix = getMatrix(el);
      // console.log("🚀 ~ file: Rotate.vue:59 ~ drawCube ~ modeViewMatrix:", modeViewMatrix)
      const modeViewMatrix2 = getModelViewMatrix4WEb(el);
      // console.log("🚀 ~ file: Rotate.vue:60 ~ drawCube ~ modeViewMatrix2:", modeViewMatrix2)
      const u_ModelViewMatrix = gl.getUniformLocation(gl.program, 'u_ModelViewMatrix');
      // 将试图矩阵传给u_ViewMatrix变量
      gl.uniformMatrix4fv(u_ModelViewMatrix, false, modeViewMatrix2.elements);

      // 开启隐藏面清除
      gl.enable(gl.DEPTH_TEST);

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

    }
  }

  function getMatrix(el: HTMLCanvasElement) {
    const viewMatrixt = new LMatrix4()
    const eye = new Vector3(3, 3, 7);
    viewMatrixt.lookAt(eye, new Vector3(0, 0, 0), new Vector3(0, 1, 0))
    var modelMatrix = new LMatrix4();
        modelMatrix.makeRotationZ(0);
        viewMatrixt.multiply(modelMatrix).transpose();
    const projMatrix = new Matrix4(null);
    projMatrix.setPerspective(30, el.width / el.height, 1, 100);
    return projMatrix.multiply(viewMatrixt);
  }

  function getModelViewMatrix4(el: HTMLCanvasElement) {
      // 设置视角矩阵的相关信息（视点，视线，上方向）
      const viewMatrixt = new LMatrix4()
      const eye = new Vector3(3, 3, 7);
      viewMatrixt.lookAt(eye, new Vector3(0, 0, 0), new Vector3(0, 1, 0))
      // const translate = new LMatrix4().makeTranslation(eye.x, eye.y, eye.z);
      // viewMatrixt.multiply(translate)
      // console.log("🚀 ~ file: Rotate.vue:82 ~ getModelViewMatrix4 ~ viewMatrixt:", viewMatrixt)
      // var viewMatrix = new Matrix4(null);
      // viewMatrix.setLookAt(3,3,7, 0, 0, 0, 0, 1, 0);
      // console.log("🚀 ~ file: Rotate.vue:63 ~ drawCube ~ viewMatrix:", viewMatrix.elements)
 
        //设置模型矩阵的相关信息
        var modelMatrix = new LMatrix4();
        modelMatrix.makeRotationZ(0);
        // modelMatrix.transpose();
 
        //设置透视投影矩阵
        const camera = new PerspectiveCamera(30, el.width / el.height, 1, 100);
        const projMatrix = new LMatrix4().copy(camera.projectionMatrix);
        console.log("🚀 ~ file: Rotate.vue:101 ~ getModelViewMatrix4 ~ projMatrix:", projMatrix.transpose())
        // projMatrix.setPerspective(30, el.width / el.height, 1, 100);
        // const projMatrix = camera.matrix
        // viewMatrixt.transpose();
        // viewMatrixt.multiply(modelMatrix)
        // viewMatrixt.transpose();
        // //计算出模型视图矩阵 viewMatrix.multiply(modelMatrix)相当于在着色器里面u_ViewMatrix * u_ModelMatrix
        var modeViewMatrix = projMatrix.multiply(viewMatrixt.multiply(modelMatrix));
        return modeViewMatrix;
  }
  function getModelViewMatrix4WEb(el: HTMLCanvasElement) {
      // 设置视角矩阵的相关信息（视点，视线，上方向）
      var viewMatrix = new Matrix4(null);
      viewMatrix.setLookAt(3,3,7, 0, 0, 0, 0, 1, 0);
      eyeRef.value = new Vector3(3, 3, 7);
      // console.log("🚀 ~ file: Rotate.vue:63 ~ drawCube ~ viewMatrix:", viewMatrix.elements)
      
      //设置模型矩阵的相关信息
      var modelMatrix = new Matrix4(null);
      modelMatrix.setRotate(0, 0, 0, 1);
        // modelMatrix.transpose();
 
        //设置透视投影矩阵
        var projMatrix = new Matrix4(null);
        projMatrix.setPerspective(30, el.width / el.height, 1, 100);
        console.log("🚀 ~ file: Rotate.vue:123 ~ getModelViewMatrix4WEb ~ projMatrix:", projMatrix)
        viewMatrix.multiply(modelMatrix)
        //计算出模型视图矩阵 viewMatrix.multiply(modelMatrix)相当于在着色器里面u_ViewMatrix * u_ModelMatrix
        var modeViewMatrix = projMatrix.multiply(viewMatrix);
        return modeViewMatrix;
  }



  function initVertexBuffers(gl: WebGLRenderingContext) {
    var verticesColors = vertices.value;


 
        //顶点索引
        var indice = indices.value;

        const verticesColorsBuffer = gl.createBuffer();
        const indicesBuffer = gl.createBuffer();

        const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
        const PER_SIZE = Float32Array.BYTES_PER_ELEMENT;
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesColorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(a_Position);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, PER_SIZE * 6, 0);


        gl.enableVertexAttribArray(a_Color);
        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, PER_SIZE * 6, PER_SIZE * 3);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indice, gl.STATIC_DRAW);

        return indice.length;

  }



</script>
<style lang='scss'>
</style>