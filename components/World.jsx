'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from '@/shaders/world/vert.glsl';
import fragmentShader from '@/shaders/world/frag.glsl';
import { useControls } from 'leva';

const World = () => {

    const canvasRef = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        return canvas;
    }, []);

    const textureRef = useMemo(() => {
        const texture = new THREE.CanvasTexture(canvasRef);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);
        return texture;
    }, [canvasRef]);

    const matRef = useRef();
    const { offset, dispScale } = useControls({ offset: { value: 0.3, step: 0.1 }, dispScale: { value: 0.2, step: 0.1 } })

    const uniforms = useMemo(() => ({
        uTime: { value: 0.0 },
        GridTexture: { value: textureRef },
        uDispScale: { value: dispScale },
        uWaterLevel: { value: 0.0 },
        uOffset: { value: offset }
    }), [textureRef]);

    useEffect(() => {
        textureRef.needsUpdate = true;
    }, [textureRef]);

    useEffect(() => {
        matRef.current.uniforms.uOffset.value = offset;
    }, [offset])

    useEffect(() => {
        matRef.current.uniforms.uDispScale.value = dispScale;
    }, [dispScale])

    useFrame(({ clock }) => {
        if (matRef.current?.uniforms) {
            matRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    const createUVSphereFromCube = (size, subdivisions) => {
        const geometry = new THREE.BoxGeometry(size, size, size, subdivisions, subdivisions, subdivisions);
        const positions = geometry.attributes.position;

        const uvs = [];

        for (let i = 0; i < positions.count; i++) {
            const vertex = new THREE.Vector3().fromBufferAttribute(positions, i).normalize();
            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);

            // Convert normalized sphere coordinates to spherical UV
            const u = 0.5 + Math.atan2(vertex.z, vertex.x) / (2 * Math.PI);
            const v = 0.5 - Math.asin(vertex.y) / Math.PI;

            uvs.push(u, v);
        }

        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        positions.needsUpdate = true;
        geometry.computeVertexNormals();

        geometry.scale(2, 2, 2);
        return geometry;
    };

    const geometryRef = useMemo(() => {
        return createUVSphereFromCube(1, 64);
    }, []);

    const { scene } = useThree();

    const handlePointerDown = (e) => {
        e.stopPropagation();
        const intersectionPoint = e.point.clone(); // Intersection point on the sphere
        const normal = intersectionPoint.clone().normalize(); // Normal at the intersection point

        // Create a cube
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 0.2),
            new THREE.MeshNormalMaterial()
        );

        // Position the cube at the intersection point
        cube.position.copy(intersectionPoint);

        // Align the cube's rotation to the sphere's surface
        const up = new THREE.Vector3(0, 1, 0); // Default up vector
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
        cube.quaternion.copy(quaternion);

        // Add the cube to the scene
        scene.add(cube);

        const uv = e.uv;
        if (!uv) return;

        const ctx = canvasRef.getContext("2d");
        const x = Math.floor(uv.x * canvasRef.width);
        const y = Math.floor((1 - uv.y) * canvasRef.height);

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();

        textureRef.needsUpdate = true;
    };

    return (
        <mesh
            onPointerDown={handlePointerDown}
            geometry={geometryRef}
        >
            {/* <icosahedronGeometry args={[2, 40]}/> */}
            <shaderMaterial
                ref={matRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                attach="material"
            />
        </mesh>
    );
};

export default World;
