// TODO: Refactor this to R3F

import * as THREE from 'three';
import VertexShader from "@/shaders/particleSystem/vert.glsl";
import FragmentShader from "@/shaders/particleSystem/frag.glsl";
import { useFrame, useThree } from '@react-three/fiber';

function getLinearSpline() {
    const points = [];
    const lerp = (t, a, b) => (a + t * (b - a));
    const addPoint = (t, d) => points.push([t, d]);

    function getValueAt(t) {
        let p1 = 0;
        for (let i = 0; i < points.length; i++) {
            if (points[i][0] >= t) break;
            p1 = i;
        }
        const p2 = Math.min(points.length - 1, p1 + 1);
        if (p1 == p2) return points[p1][1];
        return lerp((t - points[p1][0]) / (points[p2][0] - points[p1][0]), points[p1][1], points[p2][1]);
    }

    return { addPoint, getValueAt };
}

function ParticleSystem({ origin, rate, texture, magnitude = 1.0 }) {

    const { camera, scene } = useThree();
    const direction = new THREE.Vector3().copy(origin).normalize().multiplyScalar(magnitude);

    const Uniforms = {
        diffuseTexture: {
            value: new THREE.TextureLoader().load(texture)
        },
        pointMultiplier: {
            value: window.innerHeight / (2.0 * Math.tan(30.0 * Math.PI / 180.0))
        }
    };

    const material = new THREE.ShaderMaterial({
        uniforms: Uniforms,
        vertexShader: VertexShader,
        fragmentShader: FragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false,
        transparent: true,
        vertexColors: true
    });

    let particles = [];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
    geometry.setAttribute('aColor', new THREE.Float32BufferAttribute([], 4));
    geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));

    // const points = new THREE.Points(geometry, material);


    const alphaSpline = getLinearSpline();
    alphaSpline.addPoint(0.0, 0.0);
    alphaSpline.addPoint(0.6, 1.0);
    alphaSpline.addPoint(1.0, 0.0);

    const colorSpline = getLinearSpline();
    colorSpline.addPoint(0.0, new THREE.Color(0xFFFFFF));
    colorSpline.addPoint(1.0, new THREE.Color(0xff8080));

    const sizeSpline = getLinearSpline();
    sizeSpline.addPoint(0.0, 0.0);
    sizeSpline.addPoint(1.0, 1.0);

    const radius = 0.5;
    const maxLife = 1.5;
    const maxSize = 3.0;
    let elapsedTime = 0.0;

    function AddParticles(deltaTime) {
        elapsedTime += deltaTime;
        const n = Math.floor(elapsedTime * rate);
        elapsedTime -= n / rate;
        for (let i = 0; i < n; i += 1) {
            const life = (Math.random() * 0.75 + 0.25) * maxLife;
            particles.push({
                position: new THREE.Vector3(
                    (Math.random() * 2 - 1) * radius,
                    (Math.random() * 2 - 1) * radius,
                    (Math.random() * 2 - 1) * radius)
                    .add(origin),
                size: (Math.random() * 0.5 + 0.5) * maxSize,
                colour: new THREE.Color(),
                alpha: 1.0,
                life: life,
                maxLife: life,
                rotation: Math.random() * 2.0 * Math.PI,
                rotationRate: Math.random() * 0.01 - 0.005,
                velocity: direction.clone(),
            });
        }
    }

    function UpdateGeometry() {
        const positions = [];
        const sizes = [];
        const colors = [];
        const angles = [];

        for (let p of particles) {
            positions.push(p.position.x, p.position.y, p.position.z);
            colors.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
            sizes.push(p.currentSize);
            angles.push(p.rotation);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 4));
        geometry.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1));

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
        geometry.attributes.aColor.needsUpdate = true;
        geometry.attributes.angle.needsUpdate = true;
    }
    UpdateGeometry();

    function UpdateParticles(deltaTime) {
        for (let p of particles) {
            p.life -= deltaTime;
        }

        // filter out the dead particles
        particles = particles.filter(p => p.life > 0.0);

        // update the alive particles
        for (let p of particles) {
            const t = 1.0 - p.life / p.maxLife;
            p.rotation += p.rotationRate;
            p.alpha = alphaSpline.getValueAt(t);
            p.currentSize = p.size * sizeSpline.getValueAt(t);
            p.colour.copy(colorSpline.getValueAt(t));

            p.position.add(p.velocity.clone().multiplyScalar(deltaTime));

            const drag = p.velocity.clone();
            drag.multiplyScalar(deltaTime * 0.1);
            drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
            drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
            drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
            p.velocity.sub(drag);
        }

        // sort the particles based on the distance to camera
        particles.sort((a, b) => {
            const d1 = camera.position.distanceTo(a.position);
            const d2 = camera.position.distanceTo(b.position);

            if (d1 > d2) {
                return -1;
            }
            if (d1 < d2) {
                return 1;
            }
            return 0;
        });
    }

    useFrame((_, delta) => {
        AddParticles(delta);
        UpdateParticles(delta);
        UpdateGeometry();
    })

    // geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
    // geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
    // geometry.setAttribute('aColor', new THREE.Float32BufferAttribute([], 4));
    geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute name="position" array={[]} itemSize={3} />
            </bufferGeometry>
        </points>
    )
}

export { ParticleSystem as getParticleSystem };
