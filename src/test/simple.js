const {Computer, CRT} = require('ITSBasic');
const createTexture = require("gl-texture2d");
const createShader = require("gl-shader");

const computer = new Computer();
const screen = CRT(computer);

document.body.addEventListener('keydown', e => computer.keys.down(e), false);
document.body.addEventListener('keyup', e => computer.keys.up(e), false);

const w = screen.width;
const h = screen.height;

const container = document.querySelector('#container');
const canvas = document.createElement("canvas");
canvas.width = w;
canvas.height = h;
container.appendChild(canvas);

const vertShader = `attribute vec2 _p;
varying vec2 uv;
void main() {
  uv = vec2(0.5, 0.5) * (_p + vec2(1.0, 1.0));
  gl_Position = vec4(_p * 0.9,0.0,1.0);
}`;
const fragShader = `precision highp float;
varying vec2 uv;
uniform sampler2D texture;

void main() {
  float o = clamp(abs(sin(uv.y * 300.)), 0.8, 1.0);
  vec4 col = texture2D(texture, uv);
  float bbb = max(col.r,min(col.g,col.b)) * o;
  gl_FragColor = vec4(
    bbb, bbb, bbb,
    1.0);
}`;
const opts = {};
const gl = (
  canvas.getContext("webgl", opts) ||
  canvas.getContext("webgl-experimental", opts) ||
  canvas.getContext("experimental-webgl", opts)
);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1.0, -1.0,
  1.0, -1.0,
  -1.0, 1.0,
  -1.0, 1.0,
  1.0, -1.0,
  1.0, 1.0
]), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const shader = createShader(gl, vertShader, fragShader);
shader.bind();
shader.attributes._p.pointer();

const texture = createTexture(gl, [ w, h ]);
texture.minFilter = texture.magFilter = gl.LINEAR;

function loop() {
  requestAnimationFrame(loop);
  texture.setPixels(screen);
  texture.bind();
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
loop();
