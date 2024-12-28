"use client";
import { OrbitControls, Stats, StatsGl } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import Trees from './Tree';
import World from './World';
import Fire from './Fire';
import { useRef } from 'react';

const Experience = () => {
    const test = useRef();
    return (
        <div className="w-full h-full">
            <Canvas className="w-full h-full" camera={{ position: [0, 0, -7] }} shadows >
                <Stats />
                <ambientLight intensity={1.0} />
                <directionalLight
                    color="white"
                    position={[15, 15, 15]}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
                <OrbitControls />
                <World />
            </Canvas>
        </div>
    )
}

export default Experience
