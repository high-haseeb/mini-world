"use client";
import { OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import World from './World';

const Experience = () => {
    return (
        <div className="w-full h-full">
            <Canvas className="w-full h-full" camera={{ position: [0, 0, -7] }} shadows >
                <Stats />
                <ambientLight intensity={1.0} />
                <directionalLight
                    color="white"
                    position={[0, 15, -10]}
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
