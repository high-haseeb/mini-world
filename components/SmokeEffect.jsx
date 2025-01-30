import { getParticleSystem } from './ParticleSystem'
import { useFrame, useThree } from '@react-three/fiber';

const FireParticleSystem = ({ origin }) => {
    const { camera, scene } = useThree();
    const effect = getParticleSystem({ camera, parent: scene, origin: origin, rate: 50.0, texture: '/smoke.png' });

    useFrame((_, delta) => {
        effect.update(delta);
    });

    return null;

}

export default FireParticleSystem;
