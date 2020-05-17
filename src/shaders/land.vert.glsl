uniform float time;

uniform sampler2D noise;
uniform sampler2D terrain;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

const float WAVE_SCALE = 2.0;
const float WAVE_OFFSET = -1.0;

void main() {
    vColor = color;
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}