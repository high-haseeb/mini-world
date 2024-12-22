import { Color, Vector3 } from "three";

export const ToonShader = {
    uniforms: {
        uDirLightPos: { value: new Vector3(1, 3, 0) },
        uDirLightColor: { value: new Color(0xffffff) },
        uAmbientLightColor: { value: new Color(0x3a2a1b) }, // Warm brown ambient light
        uBaseColor: { value: new Color(0x8a5e3c) }, // Rich, vibrant brown
        uLineColor1: { value: new Color(0xd1975a) }, // Vibrant tan
        uLineColor2: { value: new Color(0xaf6f4b) }, // Warm mid-brown
        uLineColor3: { value: new Color(0x6e4a33) }, // Deep brown
        uLineColor4: { value: new Color(0x402417) }, // Dark, strong outline
    },
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

    gl_FragColor = vec4(color, 1.0);
  }
`,
};
