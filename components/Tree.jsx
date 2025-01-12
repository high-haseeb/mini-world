import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Color } from "three";
import { ToonShader } from "@/shaders/ToonShader";

const Tree = ({ position, rotation, burned }) => {
    const ref = useRef(null);
    const uniformsToon = {
        uTime: { value: 0.0 },
        uDirLightPos: { value: new Vector3(1, 1, 0) },
        uDirLightColor: { value: new Color(0xffffff) },
        uAmbientLightColor: { value: new Color(0x3f5b3b) },
        uBaseColor: { value: new Color(0x52734d) },
        uLineColor1: { value: new Color(0x6e8b5e) },
        uLineColor2: { value: new Color(0x3d5234) },
        uLineColor3: { value: new Color(0x2a3925) },
        uLineColor4: { value: new Color(0x1c2618) },
    };

    const scale = useRef(new Vector3(0.0, 0.0, 0.0));
    const targetScale = new Vector3(0.05, 0.05, 0.05);

    const [shouldAnimate, setShouldAnimate] = useState(false);
    useEffect(() => {
        setTimeout(() => setShouldAnimate(true), 4000);
    }, []);

    useFrame(() => {
        if (ref.current && shouldAnimate && !burned) {
            ref.current.scale.set(scale.current.x, scale.current.y, scale.current.z);
            scale.current.lerp(targetScale, 0.01);
        }
        if (burned) {
            targetScale.set(0, 0, 0);
            ref.current.scale.set(scale.current.x, scale.current.y, scale.current.z);
            scale.current.lerp(targetScale, 0.01);
        }
    });

    return (
        <group position={position} rotation={rotation} ref={ref} dispose={null} scale={0.0}>
            <mesh castShadow receiveShadow position={[0, 0, 0]} >
                <coneGeometry args={[1.2, 1.5, 10]} />
                <shaderMaterial attach="material" {...ToonShader} uniforms={uniformsToon} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
                <coneGeometry args={[1.0, 1.2, 10]} />
                <shaderMaterial attach="material" {...ToonShader} uniforms={uniformsToon} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 1.6, 0]}>
                <coneGeometry args={[0.8, 1.0, 10]} />
                <shaderMaterial attach="material" {...ToonShader} uniforms={uniformsToon} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 2.1, 0]}>
                <coneGeometry args={[0.6, 0.8, 10]} />
                <shaderMaterial attach="material" {...ToonShader} uniforms={uniformsToon} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 2.5, 0]}>
                <coneGeometry args={[0.4, 0.6, 10]} />
                <shaderMaterial attach="material" {...ToonShader} uniforms={uniformsToon} />
            </mesh>

            <mesh position={[0, -1.0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 2]} />
                <shaderMaterial {...ToonShader} attach={"material"} />
            </mesh>
        </group>
    );
};

export default Tree;
