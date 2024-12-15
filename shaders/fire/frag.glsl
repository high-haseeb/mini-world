varying vec3 v_position;
varying vec2 v_uv;
varying float v_disp;
varying vec3 v_normal;

void main() {
    // Calculate the view direction
    vec3 viewDir = normalize(cameraPosition - v_position);

    // Compute the Fresnel effect based on the angle between the view direction and surface normal
    float fresnel = pow(1.0 - dot(v_normal, viewDir), 3.0); // Basic Fresnel term

    // Step function to create a hard edge effect based on the Fresnel term
    float outerEdge = step(0.5, fresnel); // Step function to differentiate the bright outer parts
    float innerEdge = step(0.4, fresnel); // Step function to differentiate the inner darker parts

    // Define colors for the inner and outer parts of the fire
    vec3 outerColor = vec3(1.0, 0.2, 0.0); // Bright orange-red (outer parts)
    vec3 innerColor = vec3(0.4, 0.0, 0.0); // Darker red (inner parts)
    vec3 color = mix(innerColor, outerColor, outerEdge); // Hard edge for transition

    // Final color output
    gl_FragColor = vec4(color * (1.0 + fresnel), 1.0);
}
