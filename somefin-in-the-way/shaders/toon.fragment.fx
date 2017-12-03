precision highp float;

// Lights
varying vec3 vPositionW;
varying vec3 vNormalW;

// Refs
uniform vec3 cameraPosition;
uniform vec3 color;

void main(void) {
    vec3 viewDirectionW = normalize(cameraPosition - vPositionW);

    // Fresnel
	float fresnelTerm = dot(viewDirectionW, vNormalW);
	fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);
    fresnelTerm = floor(fresnelTerm + 0.1);

    gl_FragColor = vec4(fresnelTerm * color + (1. - fresnelTerm) * vec3(1., 1., 1.), 1.);
}