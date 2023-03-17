import { Vector2 } from 'three';

import { getWebGLContext, initShaders } from './webgl/cuon-utils';
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
// 绘制宽度线
export default class BoldLine {
  lineWidth: number;
  points: Vector2[];
  vertices: Float32Array;
  indices: Uint16Array;
  uv: Float32Array;
  constructor(points: Vector2[], lineWidth: number) {
    this.points = points;
    this.lineWidth = lineWidth;
    this.init(points, lineWidth);
  }

  // 生成
  init(points: Vector2[], lineWidth: number) {

    if (points.length < 2) return;
    const height = lineWidth / 2;
    const extrudePoints = this.extrude(points, height);
    const vertices: number[] = [];
    const indices: number[] = [];
    const uv: number[] = [];
    const len = points.length - 1;
    for (let i = 0; i < len; i++) {
      // two element per time
      const pi = i * 2;
      const [A1, A2, B1, B2] = [
        extrudePoints[pi],
        extrudePoints[pi + 1],
        extrudePoints[pi + 2],
        extrudePoints[pi + 3],
      ]
      vertices.push(
        ...A1.toArray(),
        ...A2.toArray(),
        ...B1.toArray(),
        ...B2.toArray()
      )
      // 
      // const ii = i * 4;
      const A1i = i * 4;
      const A2i = A1i + 1;
      const B1i = A1i + 2;
      const B2i = A1i + 3;
      const angle = - B1.clone().sub(A1).angle();
      const center = new Vector2();
      const [leftBottom, rightTop, rightBottom] = [
        A2.clone().sub(A1).rotateAround(center, angle),
        B1.clone().sub(A1).rotateAround(center, angle),
        B2.clone().sub(A1).rotateAround(center, angle),
      ]
      uv.push(
        0, 1, // A1
        leftBottom.x / height, 0, // A2
        rightTop.x / height, 1, // B1
        rightBottom.x / height, 0 // B2
      )
      indices.push(A1i, A2i, B1i, B1i, A2i, B2i);
    }
    this.uv = new Float32Array(uv);
    this.vertices = new Float32Array(vertices);
    this.indices = new Uint16Array(indices);
  }

  extrude(points: Vector2[], height: number): Vector2[] {
    const epoints: Vector2[] = [];
    // start points
    epoints.push(
      ...this.verticalExtrude(points[0], points[1], height)
    )
      const lenght = points.length;
      const lastIndex = lenght - 1;
      const len2 = lenght - 2;
    for (let i = 0; i < len2; i++) {
      const A = points[i];
      const B = points[i + 1];
      const C = points[i + 2];
      if (this.intersect(A, B, C)) {
        // 交点
        const [p1, p2] = this.bendPoints(A, B, C, height);
        epoints.push(p1, p2);
      } else {
        const [p1, p2] = this.verticalExtrude(A, B, height);
        epoints.push(p1, p2);
      }
    }
    epoints.push(
      ...this.verticalExtrude(points[len2], points[lastIndex], height, points[lastIndex])
    );
    return epoints;
  }

  /**
   * 起始点的垂直挤压点
   * @param A 
   * @param B 
   * @param height 线宽的一半
   */
  verticalExtrude(A: Vector2, B: Vector2, height: number, M: Vector2 = A) {
    const a = B.clone().sub(A);
    const A1 = new Vector2(-a.y, a.x).setLength(height).add(M);
    const A2 = new Vector2(a.y, -a.x).setLength(height).add(M);
    return [A1, A2];
  }

  /**
   * 向量a×向量b（×为向量叉乘）
   * judge 2 vector whether is intersected
   * @param A 
   * @param B 
   * @param C 
   */
  intersect(A: Vector2, B: Vector2, C: Vector2) {
    // const AB = B.clone().sub(A);
    // const BC = C.clone().sub(B);
    // return AB.cross(BC) > 0;
    const [angAB, angBC] = [
      B.clone().sub(A).angle(),
      C.clone().sub(B).angle(),
    ]
    const angle = (angAB - angBC) % Math.PI;
    return angle !== 0;
  }

  /**
   * 曲线拐点
   * @param A 
   * @param B 
   * @param C 
   * @param height 
   */
  bendPoints(A: Vector2, B: Vector2, C: Vector2, height: number) {
    const AB = B.clone().sub(A);
    const CB = B.clone().sub(C);

    // AB unit vector
    const d = AB.normalize();
    // BC unit vector
    const e = CB.normalize();
    // const BB2 unit vector 
    const b = new Vector2().addVectors(d, e).normalize();

    // calculate vector BB2's length
    // BG perpendicular to vector AB and intersect to the bottom line, and the lenght is equal to height(half lineWidth)
    const BG = new Vector2(d.y, -d.x).setLength(height);
    const BGLength = BG.length();
    console.log('BGLength === height', BGLength === height);
    // b dot BG, because b is a unit vector, |b| = 1,
    const CosBB2G = BG.clone().dot(b) / height;
    const BB2Length = BGLength / CosBB2G;
    const BB2 = b.clone().setLength(BB2Length);
    const BB1 = BB2.clone().negate();
    const B1 = BB1.add(B);
    const B2 = BB2.add(B)
    return [B1, B2];
  }
}









export function render(canvas: HTMLCanvasElement, line: BoldLine, texture: HTMLImageElement) {
  const gl = getWebGLContext(canvas);
  const { vertices, indices, uv } = line;
  if (gl) {
    // 着色器初始化
    if (initShaders(gl, V_SHADER_SOURCE, F_SHADER_SOURCE)) {
      const SIZE = Float32Array.BYTES_PER_ELEMENT;
      // 顶点缓冲
      const n = initVerticesBuffer(gl, vertices, 2, 'a_Position', SIZE * 2);
      initVerticesBuffer(gl, uv, 2, 'a_Coord', SIZE * 2);
      initTexture(gl, texture, 'u_Map')
      const indicesBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);


      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }
  }
}


function initVerticesBuffer(gl: WebGLRenderingContext, data: Float32Array, size: number, locationName: string, stride: number = 0, offset: number = 0) {

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const location = gl.getAttribLocation(gl.program, locationName);

  gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
  gl.enableVertexAttribArray(location);

  return data.length;
}

function initTexture(gl: WebGLRenderingContext, img: HTMLImageElement, locationName: string) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  const location = gl.getUniformLocation(gl.program, locationName);
  gl.uniform1i(location, 1);
}