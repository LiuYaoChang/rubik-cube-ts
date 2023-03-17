
import { WebGLUtils } from "../../lib/webgl-utils";
/**
 * 初始化着色器程序
 * @param gl 
 * @param vertexShader 
 * @param fragmentShader 
 */
export function initShaders(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
  if (isUndef(vertexShaderSource) || vertexShaderSource === '') {
    throw new SyntaxError("vertex shader source is required, but typeof" + typeof vertexShaderSource + 'is provided');
  }
  if (isUndef(fragmentShaderSource) || fragmentShaderSource === '') {
    throw new SyntaxError("fragment shader source is required, but typeof" + typeof fragmentShaderSource + 'is provided');
  }

  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  if (isUndef(program)) {
    return false;
  }
  gl.useProgram(program);
  gl.program = program as WebGLProgram;
  return true;
}

/**
 * 
 * @param gl 
 * @param vertexShader 
 * @param fragmentShader 
 */
function createProgram(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (isUndef(vertexShader) || isUndef(fragmentShader)) {
    return false;
  }
  const program = gl.createProgram();
  if (program == null) {
    console.error('unable to create program');
    return null;
  } else {
    gl.attachShader(program, vertexShader as WebGLShader);
    gl.attachShader(program, fragmentShader as WebGLShader);

    gl.linkProgram(program);
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (!linked) {
      const info = gl.getProgramInfoLog(program);
      console.error(`failed to link program: ${info}`);
      return null;
    }
    return program;
  }
}


function loadShader(gl: WebGLRenderingContext, type: number, shaderSource: string) {
  const shader = gl.createShader(type);
  if (shader == null) {
    console.error(`unable to create shader.`);
    return null; 
  } else {
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Could not compile WEbGL program. \n\n ${gl.getShaderInfoLog(shader)}`);
      return null;
    }
    return shader;
  }
}

function isUndef(val: any) {
  return val === undefined || val === null;
}


export function getWebGLContext(canvas: HTMLCanvasElement, opt_debug?: boolean) {
  const gl = WebGLUtils.setupWebGL(canvas, null, null);

  if (!gl) return null;

  // if (arguments.length < 2 || opt_debug) {
  //   gl = webg
  // }

  return gl;
}