uniform float time;

uniform sampler2D noise;
uniform sampler2D terrain;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vViewAngle;

void main() {
    vec3 color = vec3(0.25, 0.55, 0.71) * 0.9;
    float displacementCutoff = step(0.99, vColor.r);

    vec3 position = normalize(vWorldPosition);

    vec4 noiseLookup = texture2D(noise, vUv - (time * 0.001));
    vec4 noiseLookup2 = texture2D(noise, vUv + (noiseLookup.g * 0.5));
    vec4 terrainLookup = texture2D(terrain, vUv);

    float waterHeight = position.y;
    float terrainHeight = (terrainLookup.y * position.y) + noiseLookup.g;

    // Wave peaks
    float peaks = step(0.4, noiseLookup2.b);

    // Shore foam
    float foam = step(0.4, terrainLookup.y + (noiseLookup.g * 0.1) + (peaks * 0.2));
    foam *= displacementCutoff;

    vec3 result = color * (0.5 + min(0.5, position.y));
    float opacity = 0.4;

    // Highlight the sides
    result += ((1.0 - displacementCutoff) * 0.1);
    result += (foam * 0.4);

    // Add in foam
    result += (foam * 0.8);
    opacity += (foam * 0.1);

    // gl_FragColor = vec4(noiseLookup2.b, noiseLookup2.b, noiseLookup2.b, 1.0);
    gl_FragColor = vec4(result, opacity);
}