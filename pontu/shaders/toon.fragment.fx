precision highp float;

// Lights
varying vec2 positionS;
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec4 vColor;
varying vec2 vUV;

// Refs
uniform sampler2D pencil_texture;
uniform vec3 lightInvDirW;

void main(void) {
    
    float intensity = texture2D(pencil_texture, positionS * vec2(4.)).r;
    vec4 color = vec4(1.) * (1. - intensity) + vColor * intensity;

    float f = vNormalW.y;
    vec2 pencil = vec2(cos(positionS.x * 2. * 3.14), sin(positionS.y * 2. * 3.14));
    vec2 n2 = vec2(vNormalW.x, vNormalW.z);
    float threshold = 0.2 + 0.8 * abs(dot(n2, pencil));
    if (f < threshold) {
        color = vec4(vec3(0.1), 1.);
    }
    else if (f < threshold + 0.2) {
        float d = (f - threshold) / 0.2;
        color = color * d + vec4(0.1) * (1. - d);
        color.a = 1.;
    }
    else {
        color.a = 0.9;
    }
    
    gl_FragColor = color;
}