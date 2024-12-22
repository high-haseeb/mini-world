'use client';
import fragmentShader from '@/shaders/world/frag.glsl';
import vertexShader from '@/shaders/world/vert.glsl';
import { Cloud } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import Fire from './Fire';
import Tree from "./Tree"
import useStateStore, { Options } from "@/stores/stateStore";

const NUM_RAINDROPS = 500;

const World = () => {

    const { activeOption, decrementRain, decrementFire } = useStateStore();

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
    const { offset, dispScale } = useControls({ offset: { value: 0.3, step: 0.1 }, dispScale: { value: 0.2, step: 0.1 } });

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
    }, [offset]);

    useEffect(() => {
        matRef.current.uniforms.uDispScale.value = dispScale;
    }, [dispScale]);

    useFrame(({ clock }) => {
        if (matRef.current?.uniforms) {
            matRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    const createUVSphereFromCube = (size, subdivisions) => {
        const geometry = new THREE.BoxGeometry(1, 1, 1, subdivisions, subdivisions, subdivisions);
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

        geometry.scale(size, size, size);
        return geometry;
    };

    const geometryRef = useMemo(() => {
        return createUVSphereFromCube(2, 64);
    }, []);

    const [clouds, setClouds] = useState([]);
    const [fires, setFires] = useState([]);
    const [trees, setTrees] = useState([]);

    const raindropData = useMemo(() => {
        const data = [];
        for (let i = 0; i < NUM_RAINDROPS; i++) {
            data.push({
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                reset: () => { },
            });
        }
        return data;
    }, []);

    const handlePointerDown = (e) => {
        e.stopPropagation();
        const intersectionPoint = e.point.clone();
        const normal = intersectionPoint.clone().normalize();
        switch (activeOption) {
            case Options.RAIN:
                const cloudPosition = intersectionPoint.clone().addScaledVector(normal, 0.5);
                setClouds((prev) => [...prev, { position: cloudPosition, normal }]);
                decrementRain();
                break;
            case Options.FIRE:
                const firePosition = intersectionPoint.clone().addScaledVector(normal, 0.1);
                setFires((prev) => [...prev, { position: firePosition, normal }]);
                decrementFire();
                break;
            case Options.TREE:
                const treePosition = intersectionPoint.clone().addScaledVector(normal, 0.2);
                setTrees((prev) => [...prev, { position: treePosition, normal }]);
                break;

            default: break;
        }

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

    const raindropRef = useRef();
    const lineGeometryRef = useRef(new THREE.BufferGeometry());
    const positions = useRef(new Float32Array(NUM_RAINDROPS * 6)); // 2 points for each raindrop (start and end)

    // Initialize raindrop positions
    useEffect(() => {
        for (let i = 0; i < NUM_RAINDROPS; i++) {
            positions.current[i * 6 + 0] = 0; // Start position x
            positions.current[i * 6 + 1] = 0; // Start position y
            positions.current[i * 6 + 2] = 0; // Start position z
            positions.current[i * 6 + 3] = 0; // End position x
            positions.current[i * 6 + 4] = 0; // End position y
            positions.current[i * 6 + 5] = 0; // End position z
        }
        lineGeometryRef.current.setAttribute('position', new THREE.BufferAttribute(positions.current, 3));
    }, []);

    useFrame(() => {
        if (!raindropRef.current) return;

        const sphereRadius = 2;
        raindropData.forEach((raindrop, i) => {
            raindrop.position.add(raindrop.velocity);
            if (raindrop.position.length() <= sphereRadius) {
                // Reset raindrop position and velocity
                const randomCloud = clouds[Math.floor(Math.random() * clouds.length)];
                if (randomCloud) {
                    const offset = new THREE.Vector3(
                        (Math.random() - 0.5) * 0.2,
                        (Math.random() - 0.5) * 0.2,
                        (Math.random() - 0.5) * 0.2
                    );
                    raindrop.position.copy(randomCloud.position.clone().sub(randomCloud.position.clone().multiplyScalar(0.1)).add(offset));
                    raindrop.velocity.copy(randomCloud.normal.clone().multiplyScalar(-0.005));
                }
            }

            // Update line segment positions
            positions.current[i * 6 + 0] = raindrop.position.x;
            positions.current[i * 6 + 1] = raindrop.position.y;
            positions.current[i * 6 + 2] = raindrop.position.z;

            // End position: simulating a small trail behind the raindrop
            const endPositions = new THREE.Vector3().copy(raindrop.position).add(raindrop.position.clone().multiplyScalar(0.05));
            positions.current[i * 6 + 3] = endPositions.x;
            positions.current[i * 6 + 4] = endPositions.y;
            positions.current[i * 6 + 5] = endPositions.z;
        });

        lineGeometryRef.current.attributes.position.needsUpdate = true;
    });

    return (
        <group>
            {/* world */}
            <mesh
                onPointerDown={handlePointerDown}
                geometry={geometryRef}
            >
                <shaderMaterial
                    ref={matRef}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    attach="material"
                />
            </mesh>

            {clouds.map((cloud, index) => (
                <Cloud
                    key={`cloud-${index}`}
                    position={cloud.position}
                    scale={0.05}
                    speed={0.2}
                    rotation={new THREE.Euler().setFromQuaternion(
                        new THREE.Quaternion().setFromUnitVectors(
                            new THREE.Vector3(0, 1, 0),
                            cloud.normal
                        )
                    )}
                />
            ))}
            <lineSegments ref={raindropRef} geometry={lineGeometryRef.current}>
                <lineBasicMaterial color="blue" />
            </lineSegments>
            {
                fires.map((fire, index) => (
                    <Fire
                        key={index}
                        position={fire.position}
                        scale={0.1}
                        index={index}
                        rotation={new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), fire.normal))}
                    />
                ))
            }
            {
                trees.map((tree, index) => (
                    <Tree
                        key={index}
                        position={tree.position}
                        scale={0.06}
                        index={index}
                        rotation={new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tree.normal))}
                    />
                ))
            }

        </group>
    );
};

export default World
