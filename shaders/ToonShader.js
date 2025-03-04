export const ToonShader = {
    vertexShader: /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Simple noise function for vertex deformation
  float noise(vec3 position) {
    return fract(sin(dot(position, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }

  void main() {
    // Add noise-based deformation
    vec3 transformedPosition = position;
    transformedPosition.x += noise(position * 5.0) * 0.1; // Bark-like texture
    transformedPosition.z += noise(position * 3.0) * 0.1; // Irregularities

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vPosition = transformedPosition;
  }
`,
    fragmentShader: /* glsl */ `
  #define TOON
  uniform vec3 uBaseColor;
  uniform vec3 uLineColor1;
  uniform vec3 uLineColor2;
  uniform vec3 uLineColor3;
  uniform vec3 uLineColor4;
  uniform vec3 uDirLightPos;
  uniform vec3 uDirLightColor;
  uniform vec3 uAmbientLightColor;
  uniform float hovered;
  uniform float burned;
  uniform float opacity;

  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 normal = normalize(vNormal);

    // Directional light calculation
    float lightIntensity = max(dot(normal, normalize(uDirLightPos)), 0.0);

    // Vibrant toon shading levels
    vec3 color = uBaseColor;
    if (lightIntensity > 0.8) {
      color = mix(color, uLineColor1, 0.6); // More vibrant blending
    } else if (lightIntensity > 0.5) {
      color = mix(color, uLineColor2, 0.6);
    } else if (lightIntensity > 0.2) {
      color = mix(color, uLineColor3, 0.6);
    } else {
      color = mix(color, uLineColor4, 0.6);
    }

    // Adding ambient light
    vec3 ambient = uAmbientLightColor * 0.3; // Slightly stronger ambient
    color += ambient;

    // Bark texture (modulating with vPosition for variation)
    // float barkTexture = abs(sin(vPosition.y * 10.0)) * 0.25 + 0.75;
    // color *= barkTexture;

    // Enhance vibrancy with a slight HDR-like boost
    color = pow(color, vec3(0.8)); // Gamma correction for vibrancy

    if (hovered == 1.0 && burned == 0.0) {
        gl_FragColor = vec4(vec3(1.0), 1.0);
    } else {
        gl_FragColor = mix(vec4(color, 1.0), vec4(0.0, 0.0, 0.0, opacity), burned);
    }
  }
`,
};
