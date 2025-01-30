import { forwardRef, useRef, useEffect } from 'react';
import { useFrame } from "@react-three/fiber";
import vertexShader from "@/shaders/fire/vert.glsl";
import fragmentShader from "@/shaders/fire/frag.glsl";

const Fire = forwardRef(({ shouldAnimate, transparent, ...props }, ref) => {

    const uniforms = useRef({ 
        u_time:    { value: 0.0 },
        u_opacity: { value: 1.0 },
    });

    useEffect(() => {
        if (transparent) uniforms.current.u_opacity = { value: 0.5 };
    }, [transparent]);

    useFrame(({ clock }, delta) => { 
        uniforms.current.u_time.value = clock.getElapsedTime() + props.index; 
        if (shouldAnimate) {
            uniforms.current.u_opacity.value -= delta;
        }
    });

    return (
        <mesh ref={ref} {...props}>
            <sphereGeometry args={[1, 32, 32]} />
            <shaderMaterial 
                vertexShader={vertexShader} 
                fragmentShader={fragmentShader} 
                uniforms={uniforms.current} 
                transparent
                attach="material" 
            />
        </mesh>
    );
});

export default Fire;
