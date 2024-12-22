"use client";
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import Trees from './Tree';
import Fire from './Fire';

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

                <Trees position={[0, 0, 0]} />
                <Fire position={[0, -0.5, 0]} scale={[1.3, 1.5, 1.3]} />
            </Canvas>
        </div>
    )
}

export default Experience
