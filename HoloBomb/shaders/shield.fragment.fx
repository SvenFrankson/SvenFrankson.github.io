precision highp float;

varying vec3 vPosition;
varying vec3 vPositionW;
varying vec3 vNormalW;

uniform sampler2D stripeTex;
uniform float stripeLength;
uniform float height;
uniform vec3 baseColor;
uniform vec3 borderColor;

uniform vec3 source1;
uniform float sourceDist1;
uniform float noiseAmplitude;
uniform float noiseFrequency;
uniform float fresnelBias;
uniform float fresnelPower;
uniform vec3 cameraPosition;
uniform float fadingDistance;

void main(void) {
  float y = vPositionW.y + height;
  float dY = (y - floor(y / stripeLength) * stripeLength);
  vec2 stripeUv = vec2(dY / stripeLength, 0.5);

  vec3 viewDirectionW = normalize(cameraPosition - vPositionW);

  // Fresnel
	float borderTerm = (dot(viewDirectionW, vNormalW) + 1.) / 2.;

  float fresnelTerm = dot(viewDirectionW, vNormalW);
  fresnelTerm = clamp(
    pow(
      (cos(pow(fresnelTerm, 2.)*3.1415)+1.)/2.,
      8.
    ),
    0.,
    1.
  );
  vec3 color = borderTerm * baseColor + (1. - borderTerm) * borderColor;

  gl_FragColor = texture2D(stripeTex, stripeUv) * vec4(color, (borderTerm + 0.5) / 2.) + vec4(fresnelTerm);
}
