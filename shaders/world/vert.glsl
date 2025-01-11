uniform sampler2D uSDF;

varying float height;
varying vec2 vUv;

void main()
{
    vUv = uv;
    float delta = 0.2; // the scale of displacement based on the sdf
    vec3 texel = texture2D(uSDF, uv).rgb;
    height = smoothstep(0.0, 1.0, texel.r + texel.g + texel.b);
    float poleFactor = smoothstep(0.0, 0.0, uv.y); // Gradually reduce displacement near poles
    vec3 finalPosition = mix(position, position + normal * delta * poleFactor, height);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);
}
