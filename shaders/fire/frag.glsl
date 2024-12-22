#define TOON
varying vec3 v_position;
varying vec2 v_uv;
varying float v_disp;
varying vec3 v_normal;

void main() {
    // Calculate the view direction
    vec3 viewDir = normalize(cameraPosition - v_position);

    // Compute the Fresnel effect using the normal and view direction
    float fresnel = pow(1.0 - abs(dot(v_normal, viewDir)), 2.5); // Fresnel term emphasizing all edges

    // Gradient effect for fire
    float edgeIntensity = pow(fresnel, 0.5); // Control intensity around edges
    float coreIntensity = smoothstep(0.1, 0.5, fresnel); // Control the transition to the core

    // Define fire colors
    vec3 outerColor = vec3(1.0, 0.5, 0.0);  // Bright orange (edges)
    vec3 midColor = vec3(1.0, 0.2, 0.0);    // Vibrant red-orange (middle)
    vec3 innerColor = vec3(0.4, 0.0, 0.0);  // Deep red (core)

    // Mix colors based on intensity
    vec3 fireColor = mix(innerColor, midColor, coreIntensity);
    fireColor = mix(fireColor, outerColor, edgeIntensity);

    // Add glow effect
    vec3 glow = vec3(1.0, 0.4, 0.1) * fresnel * 0.5;

    // Final color output
    gl_FragColor = vec4(fireColor + glow, 1.0);
}
