'use client';
import fragmentShader from '@/shaders/world/frag.glsl';
import vertexShader from '@/shaders/world/vert.glsl';
import { Cloud, useTexture } from '@react-three/drei';
import { useFrame, useStore } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import Fire from './Fire';
import Tree from "./Tree"
import useStateStore, { Options } from "@/stores/stateStore";

const NUM_RAINDROPS = 500;

const World = () => {
    const { activeOption, decrementRain, decrementFire } = useStateStore();
    const matRef = useRef();

    const worldMap = useTexture("/map/map_2.svg");
    worldMap.colorSpace = THREE.SRGBColorSpace;
    worldMap.wrapS = THREE.RepeatWrapping;
    worldMap.wrapT = THREE.RepeatWrapping;

    const [worldMapImageData, setWorldMapImageData] = useState(null);
    const [debugCanvas, setDebugCanvas] = useState(null);

    useEffect(() => {
        if (!worldMap.image) return;
        const c = document.createElement("canvas");
        setDebugCanvas(c);
        c.width = worldMap.image.width;
        c.height = worldMap.image.height;
        c.style.position = "fixed";
        c.style.bottom = "10rem";
        c.style.left = "4rem";
        c.style.width = "20rem";
        c.style.height = "auto";
        document.body.appendChild(c);
        const ctx = c.getContext("2d");
        ctx.drawImage(worldMap.image, 0, 0);
        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        setWorldMapImageData(imageData);
    }, [worldMap])

    const getTexelValue = (u, v) => {
        if (!worldMapImageData) {
            console.error("The World Map Texture is not loaded yet. Please wait for it to be loaded");
            return;
        }

        u = (u % 1 + 1) % 1;
        v = (v % 1 + 1) % 1;

        const x = Math.floor(u * debugCanvas.width);
        const y = Math.floor((1 - v) * debugCanvas.height);
        const index = (y * debugCanvas.width + x) * 4;

        const ctx = debugCanvas.getContext("2d");
        ctx.fillStyle = "red";
        ctx.fillRect(x, y, 100, 100);
        const r = worldMapImageData.data[index];
        const g = worldMapImageData.data[index + 1];
        const b = worldMapImageData.data[index + 2];
        // const a = imageData.data[index + 3];

        return { r, g, b };
    };

    const uniforms = useMemo(() => ({
        uTime: { value: 0.0 },
        uWorldMap: { value: worldMap },
    }), [worldMap]);

    useFrame(({ clock }) => {
        if (matRef.current?.uniforms) { matRef.current.uniforms.uTime.value = clock.getElapsedTime(); }
    });

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
        if (!e.uv) {
            console.log("Can not get UV coords at the specified position");
            return;
        }

        let isValidPlace = true;
        const u = e.uv.x;
        const v = e.uv.y;
        const color = getTexelValue(u, v);
        if (color.r + color.g + color.b == 0) {
            console.warn("please place the fire on land :)")
            isValidPlace = false;
        } 

        if(!isValidPlace) {
            document.body.style.cursor = "no-drop"
            return;
        }

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
            <mesh onPointerDown={handlePointerDown} >
                <sphereGeometry args={[2, 64]} />
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
