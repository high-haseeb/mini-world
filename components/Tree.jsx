import { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Vector3, Color } from "three";
import { GhibliShader } from "@/shaders/GhilbiShader.js";
import { useFrame } from "@react-three/fiber";
import { ToonShader } from "@/shaders/ToonShader";

const Trees = (props) => {
    // const { nodes } = useGLTF("/trees.glb");

    const uniforms = useMemo(
        () => ({
            colorMap: {
                value: props.colors,
            },
            brightnessThresholds: {
                value: [0.6, 0.35, 0.001],
            },
            lightPosition: { value: new Vector3(15, 15, 15) },
        }),
        [props.colors]
    );

    const ref = useRef(null);
    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += 0.01 * Math.random();
        }
    })

    const uniformsToon = {
        uDirLightPos: { value: new Vector3(1, 1, 0) },
        uDirLightColor: { value: new Color(0xffffff) }, // Bright white directional light
        uAmbientLightColor: { value: new Color(0x3f5b3b) }, // Warm green for ambient light
        uBaseColor: { value: new Color(0x52734d) }, // Rich pine green
        uLineColor1: { value: new Color(0x6e8b5e) }, // Lighter vibrant green
        uLineColor2: { value: new Color(0x3d5234) }, // Medium dark green for shading
        uLineColor3: { value: new Color(0x2a3925) }, // Deep forest green
        uLineColor4: { value: new Color(0x1c2618) }, // Dark outline, almost black-green
    };

    return (
        <group {...props} ref={ref} dispose={null}>
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
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

// useGLTF.preload("/trees.glb");

export default Trees;
