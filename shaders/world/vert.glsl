uniform sampler2D uSDF;

varying vec3 vPosition;
varying float height;
varying vec2 vUv;

void main()
{
    vPosition = position;
    vUv = uv;
    float delta = 0.0;
    vec3 texel = texture2D(uSDF, uv).rgb;
    height = texel.r + texel.g + texel.b;
    vec3 finalPosition = position + normal * (height * delta);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);
}
