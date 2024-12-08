'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from '@/shaders/world/vert.glsl';
import fragmentShader from '@/shaders/world/frag.glsl';
import { useControls } from 'leva';

const World = () => {
    const ROWS = 10;
    const COLS = 10;

    // Create a grid texture procedurally
    const canvasRef = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        // ctx.strokeStyle = 'purple';
        // ctx.lineWidth = 3;

        // for (let r = 0; r <= ROWS; r++) {
        //     const y = (r * canvas.height) / ROWS;
        //     ctx.beginPath();
        //     ctx.moveTo(0, y);
        //     ctx.lineTo(canvas.width, y);
        //     ctx.stroke();
        // }
        //
        // for (let c = 0; c <= COLS; c++) {
        //     const x = (c * canvas.width) / COLS;
        //     ctx.beginPath();
        //     ctx.moveTo(x, 0);
        //     ctx.lineTo(x, canvas.height);
        //     ctx.stroke();
        // }

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

    const handlePointerDown = (e) => {
        e.stopPropagation();

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
