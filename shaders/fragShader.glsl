uniform float uTime;
uniform float uOffset;

uniform float uWaterLevel;
uniform float uGrassLevel;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vDisp;

void main() {
    float displacement = vDisp;
    vec3 color;
    // float uWaterLevel = -0.3;
    // float uGrassLevel = 0.0;

    // Water
    if (displacement <= uWaterLevel) {
        color = mix(vec3(0.0, 0.1, 0.6), vec3(0.0, 0.3, 0.8), displacement / uWaterLevel);
    }
    // Grassland
    else {
        color = mix(vec3(0.0, 0.3, 0.0), vec3(0.0, 0.8, 0.0), (displacement - uWaterLevel) / (uGrassLevel - uWaterLevel));
    }

    gl_FragColor = vec4(color, 1.0);
}
