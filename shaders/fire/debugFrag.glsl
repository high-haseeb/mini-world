uniform float u_time;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;

varying vec3 v_position;
varying vec2 v_uv;
varying float v_disp;
varying vec3 v_normal;

#define BLACK vec3(0.0)
#define WHITE vec3(1.0)

/*
 *	Fresnel reflection using Fresnel equations
 *
 *	@param cos_theta_incident	Dot product of incident vector and normal
 *	@param cos_critical			Cosine of critical angle, [0, 1]
 *	@param refractive_ratio		Ratio of refractive-indices, ior2/ior1
 */
float fresnel(float cos_theta_incident, float cos_critical, float refractive_ratio) {
	if (cos_theta_incident <= cos_critical)
		return 1.f;

	float sin_theta_incident2 = 1.f - cos_theta_incident*cos_theta_incident;
	float t = sqrt(1.f - sin_theta_incident2 / (refractive_ratio * refractive_ratio));
	float sqrtRs = (cos_theta_incident - refractive_ratio * t) / (cos_theta_incident + refractive_ratio * t);
	float sqrtRp = (t - refractive_ratio * cos_theta_incident) / (t + refractive_ratio * cos_theta_incident);

	return mix(sqrtRs * sqrtRs, sqrtRp * sqrtRp, .5f);
}

void main() {
    vec3 normal = v_normal;
    vec3 viewDir = normalize(cameraPosition - v_position);
    float fresnel =  fresnel(dot(viewDir, normalize(normal)), 0.0, 1.5);

    vec3 col;
    if (fresnel < 0.1) {
        col = uColor1;
    } else if (fresnel < 0.8) {
        col = uColor2;
    } else if (fresnel < 1.1) {
        col = uColor3;
    } else {
        col = uColor4;
    }

    gl_FragColor = vec4(col, 1.0);
}
