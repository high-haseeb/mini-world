#define TOON
varying vec3 v_position;
varying vec2 v_uv;
varying float v_disp;
varying vec3 v_normal;

uniform float u_time; // Add a uniform for time

void main() {
    // Calculate the view direction
    float f = v_disp + 1.0 / 2.0;

    // Create a color gradient for the fire
    vec3 col;
    if (f < 0.5) {
        col = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.5, 0.0), smoothstep(0.0, 0.5, f));
    } else {
        col = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 0.0), smoothstep(0.5, 1.0, f));
    }


    // Final color output
    gl_FragColor = vec4(col, 1.0);
}
