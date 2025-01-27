"use client";
import { Cloud, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Fire from './Fire';
import Rain from './Rain';
import useStateStore, { Options, useTreesStore, useWarnStore } from '@/stores/stateStore';
import WorldShader from './WorldModel';
import Trees from './Trees';

const World = () => {
    const { addTree } = useTreesStore();
    const { fires, rains, decrementFire, decrementRain, activeOption } = useStateStore();

    const refClouds = useRef([]);
    const refFires  = useRef([]);

    const cloudGroupRefA = useRef([]);
    const [cloudPropsA, setCloudPropsA] = useState([]);

    useEffect(() => {
        let initProps = [];
        for (let i = 0; i < 100; i++) {
            initProps.push({ 
                position:      new THREE.Vector3(),
                normal:        new THREE.Vector3(),
                shouldAnimate: false
            });
        }
        setCloudPropsA([...initProps]);
        refFires.current = [...initProps];
    }, []);

    const worldMap      = useTexture("/map/WorldMap.svg");
    worldMap.colorSpace = THREE.SRGBColorSpace;

    const sdfMap      = useTexture("/map/sdf.png");
    sdfMap.colorSpace = THREE.SRGBColorSpace;
    sdfMap.wrapS      = THREE.ClampToEdgeWrapping
    sdfMap.wrapT      = THREE.ClampToEdgeWrapping

    const waterSDFMap      = useTexture("/map/waterSDF.png");
    waterSDFMap.colorSpace = THREE.SRGBColorSpace;

    const [worldMapImageData, setWorldMapImageData] = useState(null);
    const [SDFImageData, setSDFImageData] = useState(null)
    const [debugCanvas, setDebugCanvas] = useState(null);

    useEffect(() => {
        if (!worldMap.image) return;

        const c = document.createElement("canvas");
        setDebugCanvas(c);

        c.width  = worldMap.image.width;
        c.height = worldMap.image.height;
        c.style.position = "fixed";
        c.style.bottom   = "10rem";
        c.style.left     = "4rem";
        c.style.width    = "20rem";
        c.style.height   = "auto";
        document.body.appendChild(c);

        const ctx = c.getContext("2d");
        ctx.drawImage(worldMap.image, 0, 0);
        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        setWorldMapImageData(imageData);

        if (!sdfMap.image) return;
        const sdfCanvas = document.createElement("canvas");
        sdfCanvas.width = sdfMap.image.width;
        sdfCanvas.height = sdfMap.image.height;
        const sdfCtx = sdfCanvas.getContext("2d");
        sdfCtx.drawImage(sdfMap.image, 0, 0);
        setSDFImageData(sdfCtx.getImageData(0, 0, sdfCanvas.width, sdfCanvas.height));

    }, [worldMap, sdfMap])

    const getTexelValue = (u, v, map, debug = false) => {
        u = (u % 1 + 1) % 1;
        v = (v % 1 + 1) % 1;

        const x = Math.floor(u * map.width);
        const y = Math.floor((1 - v) * map.height);
        const index = (y * map.width + x) * 4;

        if (debug) {
            const ctx = debugCanvas.getContext("2d");
            ctx.fillStyle = "red";
            ctx.fillRect(x, y, 100, 100);
        }

        const r = map.data[index];
        const g = map.data[index + 1];
        const b = map.data[index + 2];

        return { r, g, b };
    };

    const { treesState, removeTree, fireInfluenceRadius } = useTreesStore();
    const { setWarn } = useWarnStore();

    // function smoothstep(edge0, edge1, x) {
    //     const t = Math.max(0.0, Math.min(1.0, (x - edge0) / (edge1 - edge0)));
    //     return t * t * (3.0 - 2.0 * t);
    // }

    const handlePointerDown = (e) => {
        e.stopPropagation();

        let isValidPlace = true;
        const u = e.uv.x;
        const v = e.uv.y;
        const color = getTexelValue(u, v, worldMapImageData);
        if (color.g == 0) {
            setWarn();
            isValidPlace = false;
        }

        if (!isValidPlace) {
            document.body.style.cursor = "no-drop"
            setTimeout(() => document.body.style.cursor = "auto", [500]);
            return;
        }
        // const heightTexelValue = getTexelValue(u, v, SDFImageData);
        // const height = (heightTexelValue.r / 255.0) + (heightTexelValue.g / 255.0) + (heightTexelValue.b / 255.0);
        const iPoint = e.point.clone();
        const normal = e.normal.clone();

        switch (activeOption) {
            case Options.RAIN:
                {
                    const cloudPosition = iPoint.clone().addScaledVector(normal.clone(), 0.5);
                    const index = rains - 1;
                    cloudGroupRefA.current[index].position.copy(cloudPosition);
                    const rotation = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal))
                    cloudGroupRefA.current[index].rotation.copy(rotation);
                    refClouds.current.push({ index: index, growing: true });
                    addTree(iPoint.clone().addScaledVector(normal, 0.1), rotation, false);
                    decrementRain();

                    for (let i = 0; i < refFires.current.length; i++) {
                        if (refFires.current[i].position.distanceTo(iPoint) < 0.4) {
                            setTimeout(() => {
                                refFires.current[i].shouldAnimate = true;
                            }, 1500);
                        }
                    }
                } break;

            case Options.FIRE:
                {
                    const firePosition = iPoint.clone().add(iPoint.clone().normalize().multiplyScalar(0.035))
                    const fireRotation = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal));
                    decrementFire();

                    let treeBurned = false;
                    for (let i = 0; i < treesState.length; i++) {
                        const treePos = treesState[i].position;
                        if (firePosition.distanceTo(treePos) < fireInfluenceRadius && !treesState[i].burned) {
                            removeTree(i);
                            treeBurned = true;
                            refFires.current[fires - 1].position.copy(firePosition);
                            refFires.current[fires - 1].rotation.copy(treesState[i].rotation);
                        }
                    }

                    if (!treeBurned) {
                        refFires.current[fires - 1].position.copy(firePosition);
                        refFires.current[fires - 1].rotation.copy(fireRotation);
                    }
                } break;
            default: break;
        }

    };

    return (
        <group>
            <WorldShader handlePointerDown={handlePointerDown} />

            {cloudPropsA.map((cloud, index) => (
                <group
                    ref={el => cloudGroupRefA.current[index] = el}
                    position={cloud.position} key={`rain-${index}`}
                    scale={0.05}
                >
                    <CloudModel index={index} shouldAnimate={refClouds.current.filter(cloudIndex => cloudIndex.index === index)[0]} />
                </group>)
            )}
            <Trees />

            {
                refFires.current.map((fire, index) => (
                    <Fire
                        ref={el => refFires.current[index] = el}
                        scale={0.05}
                        index={index}
                        key={`fire-${index}`}
                        {...fire}
                    />
                ))
            }

        </group>
    );
};

const CloudModel = ({ index, shouldAnimate }) => {
    const [cloudOpacity, setCloudOpacity] = useState(0.0);
    const [rainOpacity, setRainOpacity] = useState(0.0);
    const [isGrowing, setIsGrowing] = useState(true);
    const [isRaining, setIsRaining] = useState(false);

    const stayTime = 4000; // ms

    useFrame((_, delta) => {
        if (shouldAnimate) {

            if (cloudOpacity < 1.0 && isGrowing) {
                setCloudOpacity(opacity => opacity + delta);
                if (cloudOpacity >= 0.9) {
                    setIsRaining(true);
                    setTimeout(() => setIsGrowing(false), stayTime);
                }
            }

            if (isRaining) {
                setRainOpacity(opacity => opacity + delta);
            } else {
                setRainOpacity(opacity => opacity - delta);
            }

            if (!isGrowing && cloudOpacity > 0.0) {
                if (isRaining) setIsRaining(false);
                if (rainOpacity < 0.1) {
                    setCloudOpacity(opacity => opacity - delta);
                }
            }
        }
    });

    return (
        <group>
            <Cloud
                seed={index}
                speed={(index * 0.001) + 0.2}
                opacity={cloudOpacity}
            />
            <Rain opacity={rainOpacity} />
        </group>
    )
}

export default World;
