precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec4 color;

// Uniforms
uniform mat4 world;
uniform mat4 worldViewProjection;

// Varying
varying vec2 positionS;
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec2 vUV;
varying vec4 vColor;

void main(void) {
    vec4 outPosition = worldViewProjection * vec4(position, 1.0);
    gl_Position = outPosition;
    

    positionS = vec2(outPosition.x, outPosition.y);
    vPositionW = vec3(world * vec4(position, 1.0));
    vNormalW = normal;

    vUV = uv;
    vColor = color;
}