
uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vDisp;
varying vec2 vUv;

void main()
{
    vPosition = position;
    vNormal = normal;
    vUv = uv;

    vec3 finalPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);
}
