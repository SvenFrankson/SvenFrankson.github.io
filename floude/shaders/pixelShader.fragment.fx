#version 300 es
precision highp float;
 
uniform vec3 lightInvDirW;
uniform vec3 col0;
uniform vec3 col1;
uniform vec3 col2;
uniform vec3 col3;
uniform vec3 col4;
uniform vec3 col5;
uniform vec3 col6;
uniform vec3 col7;

uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D tex3;
uniform sampler2D tex4;
uniform sampler2D tex5;
uniform sampler2D tex6;
uniform sampler2D tex7;

in vec3 vPositionW;
in vec3 vNormalW;
in vec2 vUv;
in vec4 vColor;

out vec4 outColor;
 
void main() {
	float sunLightFactor = (dot(vNormalW, lightInvDirW) + 1.) * 0.5;

	vec3 color = vColor.rgb;

	float d = 0.05;
	float wFactor = 0.;
	float dx = abs(vPositionW.x - round(vPositionW.x));
	float dz = abs(vPositionW.z - round(vPositionW.z));
	if (dx < 0.05 || dz < 0.05) {
		//d = 0.2;
	}

	if (abs(color.x - 0.5) < d) {
		//color.x = 0.;
		//color.y = 0.;
		//color.z = 0.;
		wFactor = 1. - abs(color.x - 0.5) / d;
	}
	else if (abs(color.y - 0.5) < d) {
		//color.x = 0.;
		//color.y = 0.;
		//color.z = 0.;
		wFactor = 1. - abs(color.y - 0.5) / d;
	}
	else if (abs(color.z - 0.5) < d) {
		//color.x = 0.;
		//color.y = 0.;
		//color.z = 0.;
		wFactor = 1. - abs(color.z - 0.5) / d;
	}
	else {
		color.x = round(color.x);
		color.y = round(color.y);
		color.z = round(color.z);
	}
	color.x = round(color.x);
	color.y = round(color.y);
	color.z = round(color.z);

	int n = int(floor(color.x * 4. + color.y * 2. + color.z));
	if (n == 0) {
		color = col0;
	}
	else if (n == 1) {
		color = col1 + texture(tex1, vUv).rgb * 0.2;
	}
	else if (n == 2) {
		color = col2 + texture(tex2, vUv).rgb * 0.2;
	}
	else if (n == 3) {
		color = col3 + texture(tex3, vUv).rgb * 0.2;
	}
	else if (n == 4) {
		color = col4 + texture(tex4, vUv).rgb * 0.2;
	}
	else if (n == 5) {
		color = col5 + texture(tex5, vUv).rgb * 0.2;
	}
	else if (n == 6) {
		color = col6 + texture(tex6, vUv).rgb * 0.2;
	}
	else if (n == 7) {
		color = col7 + texture(tex7, vUv).rgb * 0.2;
	}

	color = color * (1. - wFactor) + col0 * wFactor; 

	outColor = vec4(color * sunLightFactor, vColor.a);
}