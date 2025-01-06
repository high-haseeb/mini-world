uniform float uTime;
uniform sampler2D uWorldMap;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float height;

#define WAVE_SHARPNESS 50.0
#define WAVE_SPEED 1.0

#define LAND_COLOR_1 vec3(0.3, 0.6, 0.2) // Brownish
#define LAND_COLOR_2 vec3(0.3, 0.8, 0.1) // Greenish
#define WATER_COLOR_1 vec3(0.0, 0.4, 1.0) // Deep Blue
#define WATER_COLOR_2 vec3(0.0, 0.7, 1.0) // Bright Blue
#define SHORELINE_COLOR vec3(1.0, 1.0, 0.5) // Yellowish

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);

    float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
    return res * res;
}

void main() {
    vec3 color;
    float uWaterLevel = 0.0;

    vec2 uv = (vPosition.xy + vec2(1.0)) * 0.5;
    float height = abs(height - uWaterLevel);
    float waveEffect = sin((height * WAVE_SHARPNESS - uTime * WAVE_SPEED + noise(uv)) * 3.14159) * 0.5 + 0.5 + noise(uv * 20.0);

    if (height > uWaterLevel) {
        vec3 color1 = mix(LAND_COLOR_1, LAND_COLOR_1 * 0.0, height);
        color = mix(color1, LAND_COLOR_2, step(0.1, height));
    } else if (texture(uWorldMap, vUv).b >= 1.0) {
        color = vec3(1.0) * sin(uTime);//mix(vec3(0.8, 0.8, 0.8), WATER_COLOR_1, step(0.5, waveEffect));
    } else {
        color = mix(vec3(0.2, 0.2, 0.8), WATER_COLOR_1, 1.0 + height);
    }
    if (height > uWaterLevel) {
        color = color * mix(0.5, 1.0, height);
    }

    gl_FragColor = vec4(color, 1.0);
}
