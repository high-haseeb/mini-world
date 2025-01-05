uniform float uTime;
uniform sampler2D uWorldMap;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vDisp;
varying vec2 vUv;

void main()
{
    float offset = 1.0 / 512.0; // Adjust based on texture resolution
    vec2 offsets[9] = vec2[](
        vec2(-offset,  offset), // Top-left
        vec2( 0.0,     offset), // Top-center
        vec2( offset,  offset), // Top-right
        vec2(-offset,  0.0),    // Middle-left
        vec2( 0.0,     0.0),    // Center
        vec2( offset,  0.0),    // Middle-right
        vec2(-offset, -offset), // Bottom-left
        vec2( 0.0,    -offset), // Bottom-center
        vec2( offset, -offset)  // Bottom-right
    );

    // Sobel kernels for edge detection
    float kernelX[9] = float[](
        -1.0, 0.0, 1.0,
        -2.0, 0.0, 2.0,
        -1.0, 0.0, 1.0
    );

    float kernelY[9] = float[](
        -1.0, -2.0, -1.0,
         0.0,  0.0,  0.0,
         1.0,  2.0,  1.0
    );

    // Sample texture and calculate gradients
    float edgeX = 0.0;
    float edgeY = 0.0;

    for (int i = 0; i < 9; i++) {
        vec4 sampleValue = texture2D(uWorldMap, vUv + offsets[i]);
        float intensity = sampleValue.g; // Use green channel for land-water
        edgeX += intensity * kernelX[i];
        edgeY += intensity * kernelY[i];
    }

    // Gradient magnitude (edge strength)
    float edge = sqrt(edgeX * edgeX + edgeY * edgeY);

    // Normalize and smooth the gradient
    float smoothEdge = smoothstep(0.1, 0.3, edge); // Adjust thresholds for softness

    // Visualize the edge gradient
    // vec3 edgeColor = mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 0.0), smoothEdge);

    gl_FragColor = vec4(vec3(edgeX * edgeX, edgeY * edgeY, 0.0), 1.0);
}
