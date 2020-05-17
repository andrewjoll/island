uniform float time;

uniform sampler2D noise;
uniform sampler2D terrain;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vViewAngle;

const float WAVE_SCALE = 1.5;
const float WAVE_REPEAT = 0.125;
const float WAVE_OFFSET = -1.25;

void main() {
    vColor = color;
    vUv = uv;
    vPosition = position;
    
    float displacementCutoff = step(0.99, vColor.r);
    vec3 transformed = vec3(position);

    vec4 noiseLookup = texture2D(noise, (uv * WAVE_REPEAT) + (time * 0.001));

    transformed.y += ((noiseLookup.g * WAVE_SCALE) + WAVE_OFFSET) * displacementCutoff;

    vWorldPosition = transformed;

    vViewAngle = normalize(cameraPosition) - vec3(0.0, 0.5, 0.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}