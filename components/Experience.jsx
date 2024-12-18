"use client";
import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import World from './World';

const Experience = () => {
    return (
        <div className="w-full h-full">
            <Canvas className="w-full h-full" camera={{ position: [0, 0, -7] }}>
                <OrbitControls />
                <ambientLight />
                <directionalLight position={[10, 0, 10]} />
                <World />
            </Canvas>
        </div>
    )
}


export default Experience
