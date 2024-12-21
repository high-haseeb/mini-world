"use client";
import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import World from './World';
import Trees from './Tree';
import { Color } from 'three';
import { useRef } from 'react';

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

                <Trees
                    position={[0, 0, 0]}
                    colors={[
                        new Color("#4a8d7e").convertLinearToSRGB(),
                        new Color("#377f6a").convertLinearToSRGB(),
                        new Color("#184f52").convertLinearToSRGB(),
                        new Color("#143b36").convertLinearToSRGB(),
                    ]}
                />
                {/* <World /> */}
            </Canvas>
        </div>
    )
}


export default Experience
