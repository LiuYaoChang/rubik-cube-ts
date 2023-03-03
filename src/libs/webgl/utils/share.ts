

/**
 * 初始化着色器
 * @param gl 
 * @param VERTEXT_SHADER_SOURCE 
 * @param FRAGMENT_SHADER_SOURCE 
 */
export function initShader(gl: WebGLRenderingContext, VERTEXT_SHADER_SOURCE: string, FRAGMENT_SHADER_SOURCE: string) {
  const vertextShader = createShader(gl, VERTEXT_SHADER_SOURCE, gl.VERTEX_SHADER) as WebGLShader;
  const fragmentShader = createShader(gl, FRAGMENT_SHADER_SOURCE, gl.FRAGMENT_SHADER) as WebGLShader;
  const program = gl.createProgram() as WebGLProgram;
  gl.attachShader(program, vertextShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);
  gl.useProgram(program)
  gl.program = program;

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw `Could not compile WebGL Program. \n\n ${gl.getProgramInfoLog(program)}`;
  }
  return true;

} 

/**
 * 1. 创建一个缓冲区对象
 * 2. 将缓冲区对象，绑定至一个缓冲区
 * 3. 写入缓冲区写入数据
 * 4. 绑定缓冲区至一个属性
 * 5. 开启这个缓冲区跟属性的传送
 * @param gl 
 * @param data 
 * @param size specifying the number of components per vertex attribute. Must be 1, 2, 3, or 4.
 * @param type specifying the data type of each component in the array. Possible values:
 * @param stride 每次取几个
 * @param offset 从缓存数据中第几个开始取值
 * @param attribute 
 */
export function initVertexBuffer(gl: WebGLRenderingContext, data: Float32Array, size: number, stride: number, attribute: string, offset: number = 0) {
  const buffer = gl.createBuffer() as WebGLBuffer;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(gl.program, attribute);
  gl.vertexAttribPointer(aPosition, size, gl.FLOAT, false, stride, offset);
  gl.enableVertexAttribArray(aPosition)

  return true;

}



function createShader(gl: WebGLRenderingContext, source: string, type: number) {
  const shader = gl.createShader(type);
  if (shader) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw `Could not compile WebGL program. \n\n${gl.getShaderInfoLog(shader)}`;
    }

  }
  return shader;

}


  /**
   * Resize a canvas to match the size its displayed.
   * @param {HTMLCanvasElement} canvas The canvas to resize.
   * @param {number} [multiplier] amount to multiply by.
   *    Pass in window.devicePixelRatio for native pixels.
   * @return {boolean} true if the canvas was resized.
   * @memberOf module:webgl-utils
   */
  export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier: number = 1) {
    multiplier = multiplier || 1;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||  canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
      return true;
    }
    return false;
  }