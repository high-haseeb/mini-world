"use client";
import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import vertexShader from '@/shaders/vertShader.glsl';
import fragmentShader from '@/shaders/fragShader.glsl';
import { useControls } from 'leva';

const Experience = () => {
    return (
        <div className="w-full h-full">
            <Canvas className="w-full h-full">
                <OrbitControls />
                <ambientLight />
                <directionalLight position={[10, 0, 10]} />
                <World />
            </Canvas>
        </div>
    )
}

const World = () => {
    const matRef = useRef(null);
    const { noiseOffset, displacementScale, waterLevel, grassLevel } = useControls(
        {
            noiseOffset: { value: 0.2, min: -10, max: 10 },
            displacementScale: { value: 0.4, min: 0, max: 1.0 },
            waterLevel: { value: -0.1, min: -1.0, max: 1.0 },
            grassLevel: { value: 0.14, min: -1.0, max: 1.0 }
        }
    );

    const uniforms = useMemo(() => ({
        uOffset: { value: noiseOffset },
        uDispScale: { value: displacementScale },
        uTime: { value: 0.0 },
        uGrassLevel: { value: grassLevel },
        uWaterLevel: { value: waterLevel },
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
        matRef.current.uniforms.uGrassLevel.value = grassLevel;
    }, [grassLevel])

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
            <icosahedronGeometry args={[2, 10]} />
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
