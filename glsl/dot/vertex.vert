attribute vec4 a_Position;

void main() {
  gl_PointSize = 1.0;
  gl_Position = a_Position;
}