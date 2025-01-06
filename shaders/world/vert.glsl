uniform float uTime;
uniform sampler2D uWorldMap;
uniform float delta;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vDisp;
varying vec2 vUv;
varying float height;

void main()
{
    vPosition = position;
    vNormal = normal;
    vUv = uv;

    vec3 texel = texture2D(uWorldMap, uv).rgb;
    height = mix(0.0, 1.0, texel.g);// + mix(0.0, -0.4, texel.b);
    vec3 finalPosition = mix(position, position + normal * delta, height);;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);
}
