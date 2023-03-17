
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
uniform sampler2D u_Map1; 
uniform sampler2D u_Mask;
varying vec2 v_MapCoord;

void main() {
  vec4 s = texture2D(u_Map, v_MapCoord);
  vec4 m = texture2D(u_Mask, v_MapCoord);
  vec4 s2 = texture2D(u_Map1, v_MapCoord);
  vec4 p = vec4(1, 1, 1,1);
  if (m.x > 0.5) {
    p = mix(s2, m, 0.6);
  }
  gl_FragColor = p * s;
}
`;
// 加载纹理
function loader(url: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    }
    img.src = url;
  })
}

export function render(imgs: string[], canvas: HTMLCanvasElement) {
  const loaders = imgs.map((url: string) => {
    return loader(url);
  })
  Promise.all(loaders).then(([pic1, pic2, pic3]) => {
    let pic = pic1 as HTMLImageElement;
    let p2 = pic2 as HTMLImageElement;
    let p3 = pic3 as HTMLImageElement;
    const r = resize(canvas, pic);
    const gl = getWebGLContext(canvas) as WebGLRenderingContext;
    if (!initShaders(gl, V_SHADER_SOURCE, F_SHADER_SOURCE)) {
      return null;
    }
    createTexture(gl, pic, gl.TEXTURE2, 'u_Map',2);
    createTexture(gl, p2, gl.TEXTURE1, 'u_Mask', 1);
    createTexture(gl, p3, gl.TEXTURE3, 'u_Map1', 3);
    let mx = 1, my = 1;
    if (r > 1) {
      my = mx / r;
    } else {
      mx = my * r;
    }
    let vx = 1, vy = 1
    // 
    const vertices = new Float32Array([
      -vx, vy, 0, 1,
      -vx, -vy, 0, 0,
      vx, vy, 1, 1,
      vx, -vy, 1, 0
    ])
    const PERSIZE = Float32Array.BYTES_PER_ELEMENT;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, PERSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);
    const a_Coord = gl.getAttribLocation(gl.program, 'a_Coord');
    gl.vertexAttribPointer(a_Coord, 2, gl.FLOAT, false, PERSIZE * 4, PERSIZE * 2);
    gl.enableVertexAttribArray(a_Coord);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 4)
  })
}



function resize(container: HTMLCanvasElement, image: HTMLImageElement) {
  let pic = image as HTMLImageElement;
  const ow = pic.width;
  const oh = pic.height;
  const r = ow / oh;
  const cw = container.width;
  const ch = container.height;
  let max = cw / r;
  if (max > ch) {
    max = ch * r;
    container.width = max;
  } else {
    container.height = max;
  }
  return r;
}

// function initVerticesBuffer(gl: WebGLRenderingContext, data: Float32Array, size: number, offset: number, attribute: string) {
//   const buffer
// } 

function createTexture(gl: WebGLRenderingContext, textureImg: HTMLImageElement, index: number, attr: string, position: number = 0) {
  console.log("🚀 ~ file: clothes.ts:116 ~ createTexture ~ index:", index)
  const texture = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.activeTexture(index);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR
    )
  const location = gl.getUniformLocation(gl.program, attr);
  gl.uniform1i(location, position)
  const maxUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  const f_max = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
  // gl.bindTexture(gl.TEXTURE_2D, null);
  console.log('gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS', maxUnits, f_max);
}