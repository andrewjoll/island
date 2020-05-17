uniform float time;

uniform sampler2D noise;
uniform sampler2D terrain;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

const float WAVE_SCALE = 2.0;
const float WAVE_OFFSET = 1.0;

float causticTexture(float scale, float offsetX, float offsetY, float magitude, float direction) {
    vec2 tc = vUv;
    vec2 p = -1.0 + (tc * 2.0);
    float len = length(p);

    float uvX = tc.x + (p.x / len) * cos(len * scale - (time * 0.2) + offsetX) * magitude;
    float uvY = tc.y + (p.y / len) * sin(len * scale - (time * 0.2) + offsetY) * magitude;

    return texture2D(noise, vec2(uvX * direction, uvY * direction) * 12.0).b;
}

void main() {
    vec3 color = vec3(0.84, 0.77, 0.55) * 0.9;
    vec3 lightDirection = vec3(0.2, 1.0, 0.2);
    float sidesCutoff = step(0.99, vColor.r);

    vec3 normal = normalize(vNormal);
    vec3 position = normalize(vPosition);

    vec4 terrainLookup = texture2D(terrain, vUv);

    float terrainHeight = terrainLookup.y;
    float wetSand = min(0.9 + (smoothstep(0.4, 0.41, terrainHeight) * 0.1), 1.0);

    float causticMask = (0.5 - (terrainHeight * 2.0)) * sidesCutoff;
    
    float caustic = causticTexture(12.0, 0.0, 0.5, 0.002, 0.2) +
        causticTexture(12.0, 0.0, 0.5, -0.002, -0.2);

    float lightIntensity = dot(lightDirection, normal);
    lightIntensity = 0.5 + (lightIntensity * 0.4);

    vec3 result = color * lightIntensity;
    
    result *= wetSand;
    result += caustic * max(0.0, causticMask * 0.5);

    gl_FragColor = vec4(result, 1.0);
}