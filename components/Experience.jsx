"use client";
import { Environment, OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import World from './World';
import useStateStore, { useWarnStore } from '@/stores/stateStore';
import { useEffect } from 'react';

const Experience = () => {
    const { autoRotate } = useStateStore();
    const { warn, warnTimeout, removeWarn } = useWarnStore();

    useEffect(() => {
        if (warn) setTimeout(() => removeWarn(), warnTimeout);
    }, [warn]);

    return (
        <div className="w-full h-full">
            { warn && <div
                className='fixed top-10 left-1/2 -translate-x-1/2 bg-red-500 rounded-full font-bold text-white text-xl py-2 px-8 animate-inOut'>
                ❌ Please Place the elements on Land!
            </div> 
            }
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
                <OrbitControls autoRotate={autoRotate} />
                <World />
            </Canvas>
        </div>
    )
}

export default Experience
