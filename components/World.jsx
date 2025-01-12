"use client";
import fragmentShader from '@/shaders/world/frag.glsl';
import vertexShader from '@/shaders/world/vert.glsl';
import { Cloud, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import Fire from './Fire';
import Rain from './Rain';
import useStateStore, { Options, useTreesStore } from '@/stores/stateStore';
import Trees from './Trees';
import { createCubeSphere } from './utils';

const World = () => {
    const { addTree } = useTreesStore();
    const { fires, rains, decrementFire, decrementRain, activeOption } = useStateStore();
    console.log("rendering the world component");

    const animatedClouds = useRef([]);

    const cloudGroupRefA = useRef([]);
    const cloudElementsRefA = useRef([]);
    const [cloudPropsA, setCloudPropsA] = useState([]);

    useEffect(() => {
        let initProps = [];
        for (let i = 0; i < 100; i++) {
            initProps.push({ position: new THREE.Vector3(), normal: new THREE.Vector3(), opacity: 1.0 });
            cloudElementsRefA.current.push(1.0);
        }
        setCloudPropsA([...initProps]);
        refFires.current = [...initProps];
    }, []);

    const matRef = useRef();

    const worldMap = useTexture("/map/WorldMap.svg");
    worldMap.colorSpace = THREE.SRGBColorSpace;
    const sdfMap = useTexture("/map/sdf.png");
    sdfMap.colorSpace = THREE.SRGBColorSpace;
    sdfMap.wrapS = THREE.ClampToEdgeWrapping
    sdfMap.wrapT = THREE.ClampToEdgeWrapping

    const waterSDFMap = useTexture("/map/waterSDF.png");
    waterSDFMap.colorSpace = THREE.SRGBColorSpace;

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

    const [elementsMap, setElementsMap] = useState(null);
    useEffect(() => {
        if (elementsMap) return;
        const eCanvas = document.createElement("canvas");
        eCanvas.width = worldMap.image.width;
        eCanvas.height = worldMap.image.height;
        const ctx = eCanvas.getContext("2d");
        // ctx.clearRect(0, 0, eCanvas.width, eCanvas.height);
        ctx.fillStyle = "#181818";
        ctx.fillRect(0, 0, eCanvas.width, eCanvas.height);
        setElementsMap(eCanvas);

        eCanvas.style.position = "fixed";
        eCanvas.style.top = "10rem";
        eCanvas.style.left = "4rem";
        eCanvas.style.width = "20rem";
        eCanvas.style.height = "auto";
        document.body.appendChild(eCanvas);
    }, [worldMap]);

    /**
    * Draws a circle representing an element on the map.
    * The RGBA channels encode the following:
    * Red   - Fires
    * Blue  - Rains
    * Green - Trees
    *
    * @param {Object} position - The position of the element on the map.
    * @param {number} position.x - The x-coordinate in normalized (0 to 1) space.
    * @param {number} position.y - The y-coordinate in normalized (0 to 1) space.
    * @param {string} elementColor - The CSS color string used to draw the element.
    */
    const putElementonMap = (position, elementColor) => {
        if (!elementsMap) return;
        const radius = 100.0;
        const ctx = elementsMap.getContext("2d");

        let u = (position.x % 1 + 1) % 1;
        let v = (position.y % 1 + 1) % 1;

        const x = Math.floor(u * elementsMap.width);
        const y = Math.floor((1 - v) * elementsMap.height);
        ctx.beginPath();
        ctx.fillStyle = elementColor;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Returns the texel value for the given UV coordinate And 
     * @param {number} u - the U coordinate; 
     * @param {number} v - the V coordinate; 
     * @returns {{ r: number, g: number, b: number }} - the color at the given UV coordinate.
     * @throws {Error} - if the `worldMapImageData` is not loaded.
     */
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

        return { r, g, b };
    };

    const uniforms = useMemo(() => ({
        uTime: { value: 0.0 },
        uWorldMap: { value: worldMap },
        uSDF: { value: sdfMap },
        uWSDF: { value: waterSDFMap },
    }), [worldMap]);

    useFrame(({ clock }) => {
        if (matRef.current?.uniforms) {
            matRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }

    });


    const {treesState, removeTree, fireInfluenceRadius} = useTreesStore();

    const handlePointerDown = (e) => {
        e.stopPropagation();

        let isValidPlace = true;
        const u = e.uv.x;
        const v = e.uv.y;
        const color = getTexelValue(u, v);
        if (color.g == 0) {
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
                {
                    const cloudPosition = intersectionPoint.clone().addScaledVector(normal, 0.5);
                    const index = rains - 1;
                    cloudGroupRefA.current[index].position.copy(cloudPosition);
                    const rotation = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal))
                    cloudGroupRefA.current[index].rotation.copy(rotation);
                    animatedClouds.current.push({ index: index, growing: true });
                    putElementonMap(e.uv, "blue");
                    addTree(cloudPosition.clone().addScaledVector(normal, -0.2), rotation, false);
                    decrementRain();
                    for(let i = 0; i < refFires.current.length; i++) {
                        if(refFires.current[i].position.distanceTo(cloudPosition) < fireInfluenceRadius) {
                            refFires.current[i].position.copy(new THREE.Vector3(0)); // FIXME: animate the fire
                        }
                    }
                } break;

            case Options.FIRE:
                {
                    const firePosition = intersectionPoint.clone().addScaledVector(normal, 0.25);
                    const fireRotation = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal));
                    decrementFire();

                    let treeBurned = false;
                    for(let i = 0; i < treesState.length; i++) {
                        const treePos = treesState[i].position;
                        if (firePosition.distanceTo(treePos) < fireInfluenceRadius && !treesState[i].burned) {
                            removeTree(i);
                            treeBurned = true;
                        }
                    }

                    if (!treeBurned) {
                        refFires.current[fires - 1].position.copy(firePosition);
                        refFires.current[fires - 1].rotation.copy(fireRotation);
                    }
                    putElementonMap(e.uv, "red");
                } break;
            default: break;
        }

    };

    const refFires = useRef(new Array(100));
    const refWorld = useRef(null);

    return (
        <group>
            {/* world */}
            <mesh onPointerDown={handlePointerDown} ref={refWorld} /* geometry={createCubeSphere()} */ >
                <sphereGeometry args={[2, 128, 128]} />
                <shaderMaterial
                    ref={matRef}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    attach="material"
                />
            </mesh>

            {cloudPropsA.map((cloud, index) => (
                <group
                    ref={el => cloudGroupRefA.current[index] = el}
                    position={cloud.position} key={`rain-${index}`}
                    scale={0.05}
                >
                    <CloudModel index={index} shouldAnimate={animatedClouds.current.filter(cloudIndex => cloudIndex.index === index)[0]} />
                </group>)
            )}
            <Trees />

            {
                refFires.current.map((fire, index) => (
                    <Fire ref={el => refFires.current[index] = el} scale={0.05} index={index} {...fire} key={`fire-${index}`} />
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

export default World
