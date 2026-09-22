// Original point-terrain renderer, visually informed by Vizz's Mesh Grid #5.
// The recording supplies the frequency texture and measured wave amplitude.
const vertex = `
precision mediump float;
attribute vec2 a_grid;
uniform sampler2D u_audio;
uniform float u_time, u_energy, u_aspect, u_dpr, u_size;
varying float v_signal, v_depth;
void main() {
  float x = a_grid.x;
  float z = a_grid.y;
  float signal = texture2D(u_audio, vec2(fract(abs(x)*.23+z*.16), .5)).r;
  float depth = .55 + z*2.7;
  float wave = sin(x*3.8+z*9.0+u_time)*.11 + cos(x*6.0-z*6.0-u_time*.4)*.08;
  wave *= .3 + u_energy*3.3;
  wave += sin(z*17.0-x*2.5+u_time*.9)*signal*(.1+u_energy*.4);
  wave = clamp(wave, -.55, .55);
  float px = x*2.4 / depth / u_aspect;
  float py = .26 + (-.76+z*.57+wave) / depth;
  gl_Position = vec4(px, py, 0., 1.);
  gl_PointSize = clamp((1.4+signal*2.6+u_energy*1.1)/depth*u_dpr*u_size, 1., 8.*u_dpr*u_size);
  v_signal = signal;
  v_depth = z;
}`;
const fragment = `
precision mediump float;
uniform float u_energy, u_gain;
uniform vec3 u_colour, u_hot;
varying float v_signal, v_depth;
void main() {
  float distance = length(gl_PointCoord-vec2(.5));
  float dot = 1.-smoothstep(.1,.5,distance);
  float light = min(1., .34 + v_signal*.65 + u_energy*.55);
  vec3 colour = mix(u_colour, u_hot, min(.9,v_signal*.65+u_energy*.75));
  gl_FragColor = vec4(colour, min(1., dot*light*(.65+v_depth*.35)*u_gain));
}`;

export function createMeshRenderer(canvas, gpu = true) {
  if (!gpu) return createCanvasRenderer(canvas);
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  if (!gl) return createCanvasRenderer(canvas);
  const shader = (type, text) => {
    const result = gl.createShader(type);
    gl.shaderSource(result, text);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(result));
    return result;
  };
  const vs = shader(gl.VERTEX_SHADER, vertex),
    fs = shader(gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const points = [];
  for (let z = 0; z < 96; z++)
    for (let x = 0; x < 144; x++) points.push((x / 143 - 0.5) * 6, z / 95);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  const attr = gl.getAttribLocation(program, "a_grid");
  gl.enableVertexAttribArray(attr);
  gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
  const uniforms = Object.fromEntries(
    [
      "time",
      "energy",
      "aspect",
      "dpr",
      "colour",
      "hot",
      "gain",
      "size",
      "audio",
    ].map((key) => [key, gl.getUniformLocation(program, `u_${key}`)]),
  );
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(uniforms.audio, 0);
  gl.enable(gl.BLEND);
  canvas.dataset.renderer = "webgl";
  return {
    draw({
      spectrum,
      energy,
      phase,
      width,
      height,
      dpr,
      colour,
      hot,
      blend,
      gain,
      size,
    }) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      // Points add their light on a dark ground; on a pale one they have to
      // lay ink over it instead, or the whole field washes out to white.
      gl.blendFunc(
        gl.SRC_ALPHA,
        blend === "over" ? gl.ONE_MINUS_SRC_ALPHA : gl.ONE,
      );
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.LUMINANCE,
        64,
        1,
        0,
        gl.LUMINANCE,
        gl.UNSIGNED_BYTE,
        spectrum,
      );
      gl.uniform1f(uniforms.time, phase);
      gl.uniform1f(uniforms.energy, energy);
      gl.uniform1f(uniforms.aspect, width / Math.max(1, height));
      gl.uniform1f(uniforms.dpr, dpr);
      gl.uniform3fv(uniforms.colour, colour);
      gl.uniform3fv(uniforms.hot, hot || [0.82, 0.94, 0.47]);
      // Laid-over points carry less presence than added ones, so a pale room
      // asks for more of them.
      gl.uniform1f(uniforms.gain, gain || 1);
      gl.uniform1f(uniforms.size, size || 1);
      gl.drawArrays(gl.POINTS, 0, points.length / 2);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}

function createCanvasRenderer(canvas) {
  const ctx = canvas.getContext("2d");
  canvas.dataset.renderer = "canvas";
  return {
    draw({ spectrum, energy, phase, width, height, dpr, colour }) {
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = `rgb(${colour.map((c) => Math.round(c * 255)).join(",")})`;
      // The ambient preview shares one opacity, so paint its dots in one batch.
      const ambient = energy === 0 && spectrum.every((value) => value === 0);
      if (ambient) {
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
      }
      for (let iz = 0; iz < 50; iz++)
        for (let ix = 0; ix < 85; ix++) {
          const x = (ix / 84 - 0.5) * 6,
            z = iz / 49,
            depth = 0.55 + z * 2.7;
          const signal =
            spectrum[Math.floor(((Math.abs(x) * 0.23 + z * 0.16) % 1) * 64)] /
            255;
          const wave = Math.max(
            -0.55,
            Math.min(
              0.55,
              (Math.sin(x * 3.8 + z * 9 + phase) * 0.11 +
                Math.cos(x * 6 - z * 6 - phase * 0.4) * 0.08) *
                (0.3 + energy * 3.3) +
                Math.sin(z * 17 - x * 2.5 + phase * 0.9) *
                  signal *
                  (0.1 + energy * 0.4),
            ),
          );
          const px = width / 2 + (((x * 2.4) / depth) * height) / 2,
            py =
              ((1 - (0.26 + (-0.76 + z * 0.57 + wave) / depth)) * height) / 2;
          const radius = Math.max(
            0.5,
            (1.4 + signal * 2.6 + energy * 1.1) / depth / 2,
          );
          if (
            px < -radius ||
            px > width + radius ||
            py < -radius ||
            py > height + radius
          )
            continue;
          if (!ambient) {
            ctx.globalAlpha = Math.min(1, 0.34 + signal * 0.65 + energy * 0.55);
            ctx.beginPath();
          }
          ctx.moveTo(px + radius, py);
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          if (!ambient) ctx.fill();
        }
      if (ambient) ctx.fill();
      ctx.globalAlpha = 1;
    },
    dispose() {},
  };
}
