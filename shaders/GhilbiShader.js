import { Color, Vector3 } from "three";


export const GhibliShader = {
  uniforms: {
    colorMap: {
      value: [
        new Color("#4a8d7e").convertLinearToSRGB(),
        new Color("#377f6a").convertLinearToSRGB(),
        new Color("#184f52").convertLinearToSRGB(),
        new Color("#143b36").convertLinearToSRGB(),
      ],
    },
    brightnessThresholds: {
      value: [0.9, 0.45, 0.001],
    },
    lightPosition: { value: new Vector3(15, 15, 15) },
  },
  vertexShader: /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Simple noise function for vertex deformation
  float noise(vec3 position) {
    return fract(sin(dot(position, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }

  void main() {
    // Add exaggerated noise-based deformation
    vec3 transformedPosition = position;
    transformedPosition.x += noise(position * 3.0) * 0.15; // Enhance bark-like texture
    transformedPosition.z += noise(position * 3.0) * 0.15; // Irregularities
    transformedPosition.y += noise(position * 2.0) * 0.05; // Subtle variation on height

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vPosition = transformedPosition;
  }
`,
  fragmentShader: /* glsl */ `
    #define TOON
    precision highp float;
    precision highp int;

    // Default THREE.js uniforms available to both fragment and vertex shader
    uniform mat4 modelMatrix;

    uniform vec3 colorMap[4];
    uniform float brightnessThresholds[3];
    uniform vec3 lightPosition;

    // Variables passed from vertex to fragment shader
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 worldPosition = ( modelMatrix * vec4( vPosition, 1.0 )).xyz;
      vec3 worldNormal = normalize( vec3( modelMatrix * vec4( vNormal, 0.0 ) ) );
      vec3 lightVector = normalize( lightPosition - worldPosition );
      float brightness = dot( worldNormal, lightVector );

      vec4 final;

      if (brightness > brightnessThresholds[0])
        final = vec4(colorMap[0], 1);
      else if (brightness > brightnessThresholds[1])
        final = vec4(colorMap[1], 1);
      else if (brightness > brightnessThresholds[2])
        final = vec4(colorMap[2], 1);
      else
        final = vec4(colorMap[3], 1);

      gl_FragColor = vec4( final );
    }`,
};
