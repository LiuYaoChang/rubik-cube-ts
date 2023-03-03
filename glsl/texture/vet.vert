
attribute vec2 a_texCoord;
attribute vec2 a_Position;
uniform vec2 u_resolution;
varying vec2 v_texCoord;
void main() {
  vec2 zeroToOne = a_Position / u_resolution;
  vec2 zt2 = zeroToOne * 2.0;
  vec2 clipSpace = zt2 - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  v_texCoord = a_texCoord;
}