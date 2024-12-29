'use client';
import fragmentShader from '@/shaders/world/frag.glsl';
import vertexShader from '@/shaders/world/vert.glsl';
import { Cloud, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import Fire from './Fire';
import Tree from "./Tree"
import useStateStore, { Options } from "@/stores/stateStore";
import Rain from './Rain';

const NUM_RAINDROPS = 500;

const World = () => {
    const { activeOption, decrementRain, decrementFire, rains, fires } = useStateStore();
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

    useEffect(() => {
        let initProps = [];
        for (let i = 0; i < rains; i++) {
            initProps.push({ position: new THREE.Vector3(), normal: new THREE.Vector3() });
        }
        refClouds.current = [...initProps];
        refFires.current = [...initProps];
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

        if (!isValidPlace) {
            document.body.style.cursor = "no-drop"
            setTimeout(() => document.body.style.cursor = "auto", [500]);
            return;
        }

        const intersectionPoint = e.point.clone();
        const normal = intersectionPoint.clone().normalize();
        switch (activeOption) {
            case Options.RAIN:
                if (refClouds.current[rains - 1]) {
                    const cloudPosition = intersectionPoint.clone().addScaledVector(normal, 0.5);
                    refClouds.current[rains - 1].position.copy(cloudPosition);
                    refClouds.current[rains - 1].rotation.copy(new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)));
                    decrementRain();
                } else {
                    console.error("Loading clouds");
                }
                break;
            case Options.FIRE:
                if (refFires.current[fires - 1]) {
                    const firePosition = intersectionPoint.clone().addScaledVector(normal, 0.1);
                    refFires.current[fires - 1].position.copy(firePosition);
                    refFires.current[fires - 1].rotation.copy(new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)));
                    decrementFire();
                } else {
                    console.error("Loading fires");
                }
                break;
            case Options.TREE:
                const treePosition = intersectionPoint.clone().addScaledVector(normal, 0.2);
                // setTrees((prev) => [...prev, { position: treePosition, normal }]);
                break;

            default: break;
        }

    };

    const refClouds = useRef(new Array(rains));
    const refFires = useRef(new Array(fires));
    const refWorld = useRef(null);

    return (
        <group>
            {/* world */}
            <mesh onPointerDown={handlePointerDown} ref={refWorld}>
                <sphereGeometry args={[2, 64]} />
                <shaderMaterial
                    ref={matRef}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    attach="material"
                />
            </mesh>

            {refClouds.current.map((cloud, index) => (
                <group ref={el => refClouds.current[index] = el} position={cloud.position} key={`rain-${index}`}  scale={0.05}>
                    <Cloud
                        seed={index}
                        speed={(index * 0.001) + 0.2}
                    />
                    <Rain />
                    <Tree position={[0, -8, 0]}/>
                </group>
            ))}

            {refFires.current.map((fire, index) => (<Fire ref={el => refFires.current[index] = el} scale={0.1} index={index} {...fire} key={`fire-${index}`} />))}

        </group>
    );
};

export default World
