#version 300 es
precision highp float;
 
uniform vec3 viewPositionW;
uniform vec3 viewDirectionW;
uniform int useVertexColor;
uniform int useLightFromPOV;
uniform float autoLight;
uniform float diffuseSharpness;
uniform vec3 diffuse;
uniform sampler2D diffuseTexture;
uniform vec3 lightInvDirW;
uniform float alpha;
uniform float specularIntensity;
uniform vec3 specular;
uniform float specularCount;
uniform float specularPower;
uniform int useFlatSpecular;

in vec3 vPositionW;
in vec3 vNormalW;
in vec2 vUv;
in vec4 vColor;

out vec4 outColor;
 
void main() {
	float sunLightFactor = 0.;
	vec3 camDir = normalize(viewPositionW - vPositionW);
	if (useLightFromPOV == 1) {
		sunLightFactor = (max(dot(vNormalW, camDir), diffuseSharpness) - diffuseSharpness) / (1. - diffuseSharpness);
	}
	else {
		sunLightFactor = (max(dot(vNormalW, lightInvDirW), diffuseSharpness) - diffuseSharpness) / (1. - diffuseSharpness);
	}

	float lightFactor = 1.5;
	if (sunLightFactor < 0.99) {
		lightFactor = round(sunLightFactor * 4.) / 4. * 0.8 + 0.2;
	}

	vec3 color = diffuse * texture(diffuseTexture, vUv).rgb;
	if (useVertexColor == 1) {
		color *= vColor.rgb;
	}

	float factor = 2. * specularCount - 1.;
	float specularValue = 0.;
	vec3 lightPos = vec3(1., 1., 1.);
	vec3 mirrorCamDir = normalize(reflect(camDir, vNormalW));
	if (useFlatSpecular == 1) {
		vec3 mirrorDirAxisPlaneN = normalize(cross(vPositionW - lightPos, lightInvDirW));
		specularValue = 1. - abs(dot(mirrorDirAxisPlaneN, mirrorCamDir));
	}
	else {
		specularValue = max(dot(lightInvDirW, -mirrorCamDir), 0.);
	}
	specularValue = (cos((specularValue - 1.) * factor * 3.14) + 1.) * 0.5 * sqrt(specularValue);
	specularValue = pow(specularValue, specularPower);
	specularValue = round(specularValue * specularCount) / specularCount;
	specularValue = specularValue * specularIntensity;
	lightFactor = max(lightFactor, autoLight);

	outColor = vec4(color * lightFactor + specular * specularValue, alpha + specularValue);
}