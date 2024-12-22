"use client";
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import Trees from './Tree';
import Fire from './Fire';
import World from './World';

const Experience = () => {
    return (
        <div className="w-full h-full">
            <Canvas className="w-full h-full" camera={{ position: [0, 0, -7] }} shadows >
                <OrbitControls />
                <ambientLight intensity={1.0} />
                <directionalLight
                    color="white"
                    position={[15, 15, 15]}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />

                <World />
            </Canvas>
        </div>
    )
}

export default Experience
