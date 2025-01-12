import vertexShader from "@/shaders/fire/vert.glsl";
import fragmentShader from "@/shaders/fire/frag.glsl";
import { forwardRef, useRef } from 'react';
import { useFrame } from "@react-three/fiber";

const Fire = forwardRef((props, ref) => {
    const uniforms = useRef({ u_time: { value: 0.0 } });
    useFrame(({ clock }) => { uniforms.current.u_time.value = clock.getElapsedTime() + props.index; });

    return (
        <mesh ref={ref} {...props}>
            <sphereGeometry args={[1, 32, 32]} />
            <shaderMaterial 
                vertexShader={vertexShader} 
                fragmentShader={fragmentShader} 
                uniforms={uniforms.current} 
                attach="material" 
            />
        </mesh>
    );
});

export default Fire;
