"use client";
import { Environment, OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import World from './World';

const Experience = () => {
    return (
        <div className="w-full h-full">
            <Canvas className="w-full h-full" camera={{ position: [0, 0, -7] }} shadows>
                <Stats />
                <ambientLight intensity={1.0} />
                <directionalLight
                    color="white"
                    position={[0, -15, -10]}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />

                {/* <ambientLight intensity={0.3} /> */}
                <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                <pointLight position={[-5, 5, -5]} intensity={1} />
                <spotLight position={[0, 5, 0]} angle={0.15} intensity={1} castShadow />

                <Environment preset='city' environmentIntensity={0.4} />
                <OrbitControls autoRotate />
                <World />
            </Canvas>
        </div>
    )
}

export default Experience
