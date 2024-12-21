import { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Vector3 } from "three";
import { GhibliShader } from "@/shaders/GhilbiShader.js";
import { useFrame } from "@react-three/fiber";
import { ToonShader } from "@/shaders/ToonShader";

const Trees = (props) => {
    const { nodes } = useGLTF("/trees.glb");

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
            ref.current.rotation.y += 0.01;
        }
    })

    return (
        <group {...props} ref={ref} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Foliage.geometry}
                position={[0.33, -0.05, -0.68]}
            >
                <shaderMaterial
                    attach="material"
                    {...GhibliShader}
                    uniforms={uniforms}
                />
            </mesh>
            <mesh position={[0, -1.0, -1]}>
                <cylinderGeometry args={[0.5, 0.5, 4]} />
                <shaderMaterial {...ToonShader} attach={"material"} />
            </mesh>
        </group>
    );
};

useGLTF.preload("/trees.glb");

export default Trees;
