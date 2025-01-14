"use client";
import { Canvas } from '@react-three/fiber'
import vertexShader from "@/shaders/fire/debugVert.glsl";
import fragmentShader from "@/shaders/fire/debugFrag.glsl";
import { useEffect, useRef } from 'react';
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';
import { Color } from 'three';

const FireConfig = () => {
    return (
        <div className='bg-[#181818] w-screen h-screen overflow-hidden'>
            <Overlay />
            <Canvas className='w-full h-full'>
                <OrbitControls />
                <FireConfigurator />
            </Canvas>
        </div>
    )
}

const FireConfigurator = () => {
    const {
        target_offset,
        animation_speed,
        u_influence,
        color_a,
        color_b,
        color_c,
        color_d,
    } = useControls({
        target_offset: { value: 3.0, min: -5.0, max: 10.0 },
        animation_speed: { value: 1.0, min: 0.1, max: 2.0 },
        u_influence: { value: 0.4, min: 0.0, max: 1.0 },
        color_a: { value: 'darkred', label: 'Primary Color' },
        color_b: { value: 'orange', label: 'Secondary Color' },
        color_c: { value: 'yellow', label: 'Tertiary Color' },
        color_d: { value: 'white', label: 'Default Color' },
    });

    const uniforms = useRef(
        {
            u_time: { value: 0.0 },
            targetOffset: { value: target_offset },
            u_influence: { value: u_influence },
            uColor1: { value: new Color(color_a) },
            uColor2: { value: new Color(color_b) },
            uColor3: { value: new Color(color_c) },
            uColor4: { value: new Color(color_d) },
        }
    );

    useEffect(() => {
        uniforms.current.targetOffset.value = target_offset;
        uniforms.current.u_influence.value = u_influence;
        uniforms.current.uColor1.value = new Color(color_a);
        uniforms.current.uColor2.value = new Color(color_b);
        uniforms.current.uColor3.value = new Color(color_c);
        uniforms.current.uColor4.value = new Color(color_d);
    }, [
        target_offset,
        u_influence,
        color_a,
        color_b,
        color_c,
        color_d,
    ]);

    useFrame(({ clock }) => {
        uniforms.current.u_time.value = clock.getElapsedTime() * animation_speed
    });

    return (
        <mesh  >
            <sphereGeometry args={[1, 32, 32]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms.current}
                attach="material"
            />
        </mesh>
    );
};


const Overlay = () => {
    return (
        <div className="absolute top-6 left-6 flex flex-col select-none text-white">
            <span className="font-semibold text-5xl">Fire Configurator</span>
            <span className="font-extralight"> version: 0.0.9</span>
        </div>
    );
};


export default FireConfig;
