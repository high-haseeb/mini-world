import vertexShader from "@/shaders/fire/vert.glsl";
import fragmentShader from "@/shaders/fire/frag.glsl";
import { useRef } from 'react';
import { useFrame } from "@react-three/fiber";

const Fire = ({ index, ...props }) => {
    const ref = useRef(null);

    const uniforms = useRef({ u_time : { value: 0.0 }});
    
    useFrame(( {clock} ) => {
        if(!ref.current) return;
        ref.current.material.uniforms.u_time.value = clock.getElapsedTime();
    })

    return (
        <mesh ref={ref} {...props}>
            <sphereGeometry args={[1, 16, 16]} />
            <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms.current} attach="material" />
        </mesh>
    )
};

export default Fire;
