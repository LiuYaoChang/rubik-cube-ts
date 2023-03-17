
attribute vec2 a_Coord;
attribute vec4 a_Position;
varying vec2 v_MapCoord;
void main() {
  gl_Position = a_Position;
  v_MapCoord = a_Coord;
}