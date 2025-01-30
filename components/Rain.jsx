import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { extend, useFrame } from '@react-three/fiber';

extend({ LineBasicMaterial: THREE.LineBasicMaterial });

const Rain = ({ opacity }) => {
    const rainRef = useRef();
    const noiseRef = useRef();
    const gCount = 500;

    const globalUniforms = {
        time: { value: 0 },
        noise: { value: null },
        globalBloom: { value: 0.0 },
    };

    const noise = `
    float smoothNoise2(vec2 uv) {
      return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
  `;

    useEffect(() => {
        const gPos = [];
        const gEnds = [];

        for (let i = 0; i < gCount; i++) {
            let x = THREE.MathUtils.randFloatSpread(5);
            let y = THREE.MathUtils.randFloat(0, 8);
            let z = THREE.MathUtils.randFloatSpread(5);
            let len = THREE.MathUtils.randFloat(0.25, 0.5);
            gPos.push(x, y, z, x, y, z);
            gEnds.push(0, len, 1, len);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(gPos, 3));
        geometry.setAttribute('gEnds', new THREE.Float32BufferAttribute(gEnds, 2));

        rainRef.current.geometry = geometry;

        // Noise creation
        const renderTarget = new THREE.WebGLRenderTarget(512, 512);
        const rtScene = new THREE.Scene();
        const rtCamera = new THREE.Camera();
        const rtGeo = new THREE.PlaneGeometry(2, 2);
        const rtMat = new THREE.MeshBasicMaterial({
            onBeforeCompile: (shader) => {
                shader.uniforms.time = globalUniforms.time;
                shader.fragmentShader = `
          uniform float time;
          ${noise}
          ${shader.fragmentShader}
        `.replace(
                    `vec4 diffuseColor = vec4( diffuse, opacity );`,
                    `
            vec3 col = vec3(0);
            float h = clamp(smoothNoise2(vUv * 50.), 0., 1.);
            col = vec3(h);
            vec4 diffuseColor = vec4( col, opacity );
          `
                );
            },
        });
        rtMat.defines = { USE_UV: "" };
        const rtPlane = new THREE.Mesh(rtGeo, rtMat);
        rtScene.add(rtPlane);

        globalUniforms.noise.value = renderTarget.texture;
        noiseRef.current = { renderTarget, rtScene, rtCamera };
    }, [gCount]);

    useFrame(({ gl, clock }) => {
        globalUniforms.time.value = clock.getElapsedTime();

        if (shaderRef.current) {
            shaderRef.current.uniforms.time = { value: clock.getElapsedTime() };
        }
        // Render the noise texture
        if (noiseRef.current) {
            const { renderTarget, rtScene, rtCamera } = noiseRef.current;
            gl.setRenderTarget(renderTarget);
            gl.render(rtScene, rtCamera);
            gl.setRenderTarget(null);
        }
    });
    const shaderRef = useRef(null);

    return (
        <lineSegments ref={rainRef} position={[0, -13, 0]}>
            <lineBasicMaterial
                transparent
                opacity={opacity}
                onBeforeCompile={(shader) => {
                    shaderRef.current = shader;
                    shader.uniforms.time = { value: 0 };
                    shader.uniforms.noiseTex = { value: globalUniforms.noise };
                    shader.uniforms.globalBloom = { value: globalUniforms.globalBloom };

                    shader.vertexShader = `
                    uniform float time;
                    uniform sampler2D noiseTex;
                    attribute vec2 gEnds;
                    varying float vGEnds;
                    varying float vH;
                    ${shader.vertexShader}
                    `.replace(
                        `#include <begin_vertex>`,
                        `#include <begin_vertex>
                    vec3 pos = position;
                    vec2 nUv = (vec2(pos.x, -pos.z) - vec2(-25.)) / 50.;
                    float h = texture2D(noiseTex, nUv).g;
                    h = (h - 0.5) * 4.;
                    pos.y = -mod(10. - (pos.y - time * 5.), 8.) + 10.;
                    h = pos.y - h;
                    pos.y += gEnds.x * gEnds.y;
                    transformed = pos;
                    vGEnds = gEnds.x;
                    vH = smoothstep(3., 0., h);
                `
                    );

                    shader.fragmentShader = `
                    uniform float time;
                    uniform float globalBloom;
                    varying float vGEnds;
                    varying float vH;
                    ${noise}
                    ${shader.fragmentShader}
                    `.replace(
                        `vec4 diffuseColor = vec4( diffuse, opacity );`,
                        `
                        float op = 1. - vGEnds;
                        op = pow(op, 3.);
                        float h = (pow(vH, 3.) * 0.5 + 0.5);
                        vec3 col = diffuse * h; // lighter close to the surface
                        col *= 1. + smoothstep(0.99, 1., h); // sparkle at the surface
                        vec4 diffuseColor = vec4( col, opacity );
                    `
                    );
                }}
            />
        </lineSegments>
    );
};

export default Rain;
