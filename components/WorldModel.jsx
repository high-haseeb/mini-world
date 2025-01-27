"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { SRGBColorSpace } from "three";
import useStateStore from "@/stores/stateStore";

const WorldShader = ({ handlePointerDown }) => {

    const worldMap    = useTexture("/map/WorldMap.svg");
    const sdfMap      = useTexture("/map/sdf.png");
    const waterSDFMap = useTexture("/map/waterSDF.png");

    worldMap.colorSpace    = SRGBColorSpace;
    sdfMap.colorSpace      = SRGBColorSpace;
    waterSDFMap.colorSpace = SRGBColorSpace;

    const vertexPars = `
        uniform sampler2D uSDF;
        varying vec3 vPosition;
        varying float height;
        varying vec2 vUv;
        `;
    const vertexMain = `
        vPosition = position;
        vUv = uv;
        float delta = 0.1;
        vec3 texel = texture2D(uSDF, uv).rgb;
        // height = smoothstep(0.0, 1.0, texel.r + texel.g + texel.b);
        height = texel.r + texel.g + texel.b;
        transformed = position + normal * (height * delta);
    `;

    const fragmentPars = `
        uniform float uTime;
        uniform sampler2D uWorldMap;
        uniform sampler2D uSDF;
        varying float height;
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform sampler2D uWSDF;

        #define GREEN  vec3(0.0, 1.0, 0.0)
        #define BLUE vec3(0.0, 0.0, 1.0)
        #define WHITE vec3(1.0, 1.0, 1.0)
        #define BLACK vec3(0.0, 0.0, 0.0)

        #define WAVE_SHARPNESS 5.0
        #define WAVE_SPEED 1.0
        // float rand(vec2 n) {
        //     return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        // }

        float noise(vec2 p) {
            vec2 ip = floor(p);
            vec2 u = fract(p);
            u = u * u * (3.0 - 2.0 * u);

            float res = mix(
                    mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
                    mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
            return res * res;
        }
    `;
    const fragmentMain = `
        vec3 WorldTexel = texture2D(uWorldMap, vUv).rgb;
        vec3 Color;
        vec3 texel = texture2D(uSDF, vUv).rgb;
        vec3 texelWater = texture2D(uWSDF, vUv).rgb;
        float distanceFromLand = texelWater.r + texelWater.g + texelWater.b;
        if (WorldTexel.g > 0.01) {
            Color = mix(GREEN * 0.6, GREEN * 1.5, height);
        } else if (WorldTexel.r > 0.2 && distanceFromLand < 1.0) {
            vec2 uv = (vPosition.xy + vec2(1.0)) * 0.5;
            float waveEffect = sin((distanceFromLand * WAVE_SHARPNESS + uTime * WAVE_SPEED + noise(uv * 10.0)) * 3.14159) * 0.5 + 0.5 + noise(uv * 20.0);
            Color = mix(BLUE * 0.5, BLUE, step(0.5, waveEffect));
        } else {
            Color = BLUE;
        }

        vec4 diffuseColor = vec4(Color, 1.0);
    `;

    const matRef = useRef(null);
    const { stopAutoRotate, startAutoRotate } = useStateStore();

    const handleOnBeforeCompile = (shader) => {
        matRef.current.userData.shader = shader;
        shader.uniforms.uTime     = { value : 0.0 };
        shader.uniforms.uWorldMap = { value: worldMap };
        shader.uniforms.uSDF      = { value: sdfMap };
        shader.uniforms.uWSDF     = { value: waterSDFMap };

        const parseVertexString = `#include <displacementmap_pars_vertex>`;
        const mainVertexString  = `#include <displacementmap_vertex>`;
        shader.vertexShader = shader.vertexShader.replace(parseVertexString, parseVertexString + vertexPars);
        shader.vertexShader = shader.vertexShader.replace(mainVertexString, mainVertexString + vertexMain);

        const parseFragmentString = `#include <bumpmap_pars_fragment>`;
        const mainFragmentString  = `vec4 diffuseColor = vec4( diffuse, opacity );`;
        shader.fragmentShader = shader.fragmentShader.replace(parseFragmentString, parseFragmentString + fragmentPars);
        shader.fragmentShader = shader.fragmentShader.replace(mainFragmentString, fragmentMain);
    };

    useFrame(({ clock }) => {
        if (!matRef.current.userData.shader) return
        matRef.current.userData.shader.uniforms.uTime.value = clock.getElapsedTime();
    });

    return (
        <mesh 
            receiveShadow
            onPointerDown={handlePointerDown}
            onPointerEnter={stopAutoRotate}
            onPointerLeave={startAutoRotate}
        >
            <sphereGeometry args={[2, 128, 128]}/>
            <meshStandardMaterial
                metalness={0.4}
                roughness={1.0}
                ref={matRef}
                onBeforeCompile={handleOnBeforeCompile}
            />
        </mesh>
    )
};

export default WorldShader;
