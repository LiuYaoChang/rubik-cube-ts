// precision mediump float;

// varying vec4 v_Color;
// void main() {
//   gl_FragColor = v_Color;
// }


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