import * as THREE from 'three';

export function createCubeSphere(radius = 2, segments = 64) {
    const geometry = new THREE.BoxGeometry(radius, radius, radius, segments, segments, segments);

    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    for (let i = 0; i < position.count; i++) {
        // Retrieve the vertex position
        const vertex = new THREE.Vector3().fromBufferAttribute(position, i);

        // Project vertex onto the sphere and avoid floating-point artifacts
        const length = Math.sqrt(vertex.x ** 2 + vertex.y ** 2 + vertex.z ** 2);
        if (length > 0) {
            vertex.set(
                (vertex.x / length) * radius,
                (vertex.y / length) * radius,
                (vertex.z / length) * radius
            );
        }
        position.setXYZ(i, vertex.x, vertex.y, vertex.z);

        // Correct UV mapping for spherical projection
        let u = 0.5 + Math.atan2(vertex.z, vertex.x) / (2 * Math.PI);
        let v = 0.5 - Math.asin(vertex.y / radius) / Math.PI;

        if (u < 0.0) u += 1.0; // Ensure `u` is always positive
        if (u > 0.999) u = 0.0; // Prevent wraparound
        uv.setXY(i, u, v);
    }

    // Compute normals and bounding sphere
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();

    return geometry;
}
