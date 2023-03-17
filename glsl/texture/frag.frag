
precision mediump float;

uniform sampler2D u_Map; 
varying vec2 v_MapCoord;

void main() {
  gl_FragColor = texture2D(u_Map, v_MapCoord);
}