import React from 'react'
import * as THREE from 'three';
import { getParticleSystem } from './ParticleSystem'
import { useFrame, useThree } from '@react-three/fiber';

const FireParticleSystem = () => {
    const { camera, scene } = useThree();
    // const { camera, emitter, parent, rate, texture } = params;
    const effect = getParticleSystem({ camera, parent: scene, origin: new THREE.Vector3(0, 2, 0), rate: 50.0, texture: '/fire2.png' });
    useFrame((_, delta) => {
        effect.update(delta);
    })
    return (
        <>
        </>
    )
}

export default FireParticleSystem;
