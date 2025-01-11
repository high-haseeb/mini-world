uniform float uTime;
uniform sampler2D uWorldMap;
uniform sampler2D uSDF;
varying float height;
varying vec2 vUv;
uniform sampler2D uWSDF;

#define GREEN  vec3(0.0, 1.0, 0.0)
#define BLUE vec3(0.0, 0.0, 1.0)
#define WHITE vec3(1.0, 1.0, 1.0)
#define BLACK vec3(0.0, 0.0, 0.0)


#define WAVE_SHARPNESS 1.0
#define WAVE_SPEED 1.0
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
    vec3 WorldTexel = texture2D(uWorldMap, vUv).rgb;
    vec3 Color;
    vec3 texel = texture2D(uSDF, vUv).rgb;
    if (WorldTexel.g > 0.01) {
        Color = mix(GREEN * 0.6, GREEN * 1.5, height);
    } else if (WorldTexel.r > 0.01) {
        vec3 texel = texture2D(uWSDF, vUv).rgb;
        float distanceFromLand = texel.r + texel.g + texel.b;
        // float waveEffect = sin((distanceFromLand * -1.0 + uTime * noise(vec2(distanceFromLand)) ) * 3.14159) * 0.5 + 0.5;
        Color = mix(BLUE, BLUE * 0.8, distanceFromLand);
    } else {
        Color = BLUE;
    }

    gl_FragColor = vec4(Color, 1.0);
}
