import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Color } from "three";
import { lerp } from 'three/src/math/MathUtils';
import { ToonShader } from "@/shaders/ToonShader";

const Tree = ({ position, rotation, burned, setBurned, ...props }) => {
    const treeRef = useRef(null);
    const uniformsToon = useRef({
        uTime: { value: 0.0 },
        uDirLightPos:       { value: new Vector3(1, 1, 0) },
        uDirLightColor:     { value: new Color(0xffffff) },
        uAmbientLightColor: { value: new Color(0x3f5b3b) },
        uBaseColor:  { value: new Color(0x52734d) },
        uLineColor1: { value: new Color(0x6e8b5e) },
        uLineColor2: { value: new Color(0x3d5234) },
        uLineColor3: { value: new Color(0x2a3925) },
        uLineColor4: { value: new Color(0x1c2618) },
        hovered: { value: false },
        burned:  { value: 0.0 },
        opacity: { value: 1.0 },
    });

    const scale = useRef(new Vector3(0.005, 0.0, 0.005));
    const targetScale = new Vector3(0.05, 0.05, 0.05);

    const [shouldAnimate, setShouldAnimate] = useState(false);
    useEffect(() => {
        setTimeout(() => setShouldAnimate(true), 4000);
    }, []);

    useFrame((_, delta) => {
        /* growing in animation */
        if (treeRef.current && shouldAnimate && !burned) {
            treeRef.current.scale.set(scale.current.x, scale.current.y, scale.current.z);
            scale.current.lerp(targetScale, 0.01);
        }

        /* burning animation */
        if (burned) {
            if (uniformsToon.current.burned.value <= 0.99) {
                uniformsToon.current.burned = { value: lerp(uniformsToon.current.burned.value, 1.0, 0.01)};
            } else {
                uniformsToon.current.opacity = { value: uniformsToon.current.opacity.value - delta };
            }
        }
    });

    return (
        <group 
            ref={treeRef}
            position={position}
            rotation={rotation}
            scale={0.0}
            dispose={null}
            onPointerEnter={() => uniformsToon.current.hovered.value = 1.0}
            onPointerLeave={() => uniformsToon.current.hovered.value = 0.0}
            {...props}
        >
            <mesh castShadow receiveShadow position={[0, 0, 0]} >
                <coneGeometry args={[1.2, 1.5, 10]} />
                <shaderMaterial attach="material" {...ToonShader} uniforms={uniformsToon.current} transparent/>
            </mesh>
            <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
                <coneGeometry args={[1.0, 1.2, 10]} />
                <shaderMaterial attach="material" {...ToonShader} uniforms={uniformsToon.current} transparent/>
            </mesh>
            <mesh castShadow receiveShadow position={[0, 1.6, 0]}>
                <coneGeometry args={[0.8, 1.0, 10]} />
                <shaderMaterial attach="material" {...ToonShader} uniforms={uniformsToon.current} transparent/>
            </mesh>
            <mesh castShadow receiveShadow position={[0, 2.1, 0]}>
                <coneGeometry args={[0.6, 0.8, 10]} />
                <shaderMaterial attach="material" {...ToonShader} uniforms={uniformsToon.current} transparent/>
            </mesh>
            <mesh castShadow receiveShadow position={[0, 2.5, 0]}>
                <coneGeometry args={[0.4, 0.6, 10]} />
                <shaderMaterial attach="material" {...ToonShader} uniforms={uniformsToon.current} transparent/>
            </mesh>

            <mesh position={[0, -1.0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 2]} />
                <shaderMaterial {...ToonShader} attach={"material"} transparent/>
            </mesh>
        </group>
    );
};

export default Tree;
