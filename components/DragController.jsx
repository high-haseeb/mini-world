// This is the drag and drop controller. 
// Would drag and drop on a plane, until in contact with the world.

import { useFrame } from "@react-three/fiber";
import { useState, useRef } from "react"
import * as THREE from "three";

const DragController = () => {
    const meshRef = useRef(null);
    const worldRef = useRef(null);
    const planeRef = useRef(null);
    const [isPointerDown, setIsPointerDown] = useState(false);

    let interactions;

    return (
        <>
            <mesh rotation={[0, Math.PI, 0]} ref={planeRef}>
                <planeGeometry args={[100, 100, 1, 1]} />
                <meshBasicMaterial color={"lime"} />
            </mesh>
            <mesh ref={worldRef}>
                <sphereGeometry args={[2, 64]} />
                <meshBasicMaterial transparent opacity={0.1} />
            </mesh>

            <mesh ref={meshRef} onPointerDown={() => setIsPointerDown(true)} onPointerUp={() => setIsPointerDown(false)} position={[10, 0, 0]}>
                <boxGeometry />
                <meshNormalMaterial />
            </mesh>

        </>
    )
}

export default DragController;
