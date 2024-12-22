"use client";
import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import World from './World';
import Trees from './Tree';
import { Color } from 'three';
import { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { GhibliShader } from "@/shaders/GhilbiShader.js";
import { ToonShader } from "@/shaders/ToonShader";


const Experience = () => {

    return (
        <div className="w-full h-full">
            <Canvas className="w-full h-full" camera={{ position: [0, 0, -7] }} shadows >
                <OrbitControls />
                <ambientLight intensity={0.1} />
                <directionalLight
                    color="white"
                    position={[15, 15, 15]}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />

                <group position={[-1, 0, 0]}>
                    <Trees
                        position={[0, 0, 0]}
                        colors={[
                            new Color("#4a8d7e").convertLinearToSRGB(),
                            new Color("#377f6a").convertLinearToSRGB(),
                            new Color("#184f52").convertLinearToSRGB(),
                            new Color("#143b36").convertLinearToSRGB(),
                        ]}
                    />
                    <Trees
                        position={[1, -0.4, 0]}
                        scale={0.8}
                        colors={[
                            new Color("#4a8d7e").convertLinearToSRGB(),
                            new Color("#377f6a").convertLinearToSRGB(),
                            new Color("#184f52").convertLinearToSRGB(),
                            new Color("#143b36").convertLinearToSRGB(),
                        ]}
                    />
                    <Trees
                        position={[1, -0.4, -1]}
                        scale={0.8}
                        colors={[
                            new Color("#4a8d7e").convertLinearToSRGB(),
                            new Color("#377f6a").convertLinearToSRGB(),
                            new Color("#184f52").convertLinearToSRGB(),
                            new Color("#143b36").convertLinearToSRGB(),
                        ]}
                    />
                </group>

                <group position={[2, 0, 0]}>

                    <group dispose={null}>
                        <mesh castShadow receiveShadow position={[0, 0, 0]}>
                            <coneGeometry args={[1.2, 1.5, 10]} />
                            <shaderMaterial attach="material" {...GhibliShader}  />
                        </mesh>
                        <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
                            <coneGeometry args={[1.0, 1.2, 10]} />
                            <shaderMaterial attach="material" {...GhibliShader}  />
                        </mesh>
                        <mesh castShadow receiveShadow position={[0, 1.6, 0]}>
                            <coneGeometry args={[0.8, 1.0, 10]} />
                            <shaderMaterial attach="material" {...GhibliShader}  />
                        </mesh>
                        <mesh castShadow receiveShadow position={[0, 2.1, 0]}>
                            <coneGeometry args={[0.6, 0.8, 10]} />
                            <shaderMaterial attach="material" {...GhibliShader}  />
                        </mesh>
                        <mesh castShadow receiveShadow position={[0, 2.5, 0]}>
                            <coneGeometry args={[0.4, 0.6, 10]} />
                            <shaderMaterial attach="material" {...GhibliShader}  />
                        </mesh>

                        <mesh position={[0, -1.0, 0]}>
                            <cylinderGeometry args={[0.2, 0.2, 2]} />
                            <shaderMaterial {...ToonShader} attach={"material"} />
                        </mesh>
                    </group>
                </group>
            </Canvas>
        </div>
    )
}


export default Experience
