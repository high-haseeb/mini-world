"use client";
import { Box, OrbitControls, useTexture } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import vertexShader from '@/shaders/world/vert.glsl';
import fragmentShader from '@/shaders/world/frag.glsl';
import { useControls } from 'leva';
import Fire from './Fire';

const Experience = () => {
    return (
        <div className="w-full h-full">
            <Canvas className="w-full h-full" camera={{position: [0, 0, -7]}}>
                <OrbitControls />
                <ambientLight />
                <directionalLight position={[10, 0, 10]} />
                {/* <Fire /> */}
                <World />
            </Canvas>
        </div>
    )
}

const World = () => {
    const matRef = useRef(null);
    const { noiseOffset, displacementScale, waterLevel } = useControls(
        {
            noiseOffset: { value: 0.2, min: -10, max: 10 },
            displacementScale: { value: 0.4, min: 0, max: 1.0 },
            waterLevel: { value: 0.0, min: -1.0, max: 1.0 },
        }
    );

    const WaterNormalTex = useTexture("/textures/water-nor.jpeg");
    const uniforms = useMemo(() => ({
        uOffset: { value: noiseOffset },
        uDispScale: { value: displacementScale },
        uTime: { value: 0.0 },
        uWaterLevel: { value: waterLevel },
        WaterNormalTex: { value: WaterNormalTex },
    }), []);

    useEffect(() => {
        if (!matRef.current.uniforms) return;
        matRef.current.uniforms.uOffset.value = noiseOffset;
    }, [noiseOffset])

    useEffect(() => {
        if (!matRef.current.uniforms) return;
        matRef.current.uniforms.uDispScale.value = displacementScale;
    }, [displacementScale])

    useEffect(() => {
        if (!matRef.current.uniforms) return;
        matRef.current.uniforms.uWaterLevel.value = waterLevel;
    }, [waterLevel])

    useFrame(({ clock }) => {
        if (!matRef.current.uniforms) return;
        matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    });

    return (
        <mesh>
            <icosahedronGeometry args={[2, 40]} />
            <shaderMaterial
                ref={matRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                attach="material"
            />
        </mesh>
    )
}

export default Experience
