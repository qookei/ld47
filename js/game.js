import { Texture, ShaderProgram, Mesh } from './opengl.js';
import { mat4 } from '../thirdparty/gl-matrix/index.js';

let gl = null;

export class Game {
	constructor(gl_) {
		gl = gl_;

		this.floshed = new Texture(gl, "../res/floshed.png");
		this.shader_program = new ShaderProgram(gl, "../res/vertex.glsl", "../res/fragment.glsl");
		this.test_mesh = new Mesh(gl);
		this.test_mesh.set_vertices([
			[-2048, -2048, 0, 1, 1, 0, 1, 1, 1, 1],
			[ 2048, -2048, 0, 1, 1, 0, 1, 1, 1, 1],
			[ 2048,  2048, 0, 1, 1, 0, 1, 1, 1, 1],

			[-2048,  2048, 0, 1, 1, 0, 1, 1, 1, 1],
			[-2048, -2048, 0, 1, 1, 0, 1, 1, 1, 1],
			[ 2048, -2048, 0, 1, 1, 0, 1, 1, 1, 1],
		])
	}

	then = 0;
	run(now = 0) {
		now *= 0.001;
		const dt = now - this.then;
		this.then = now;

		this.draw(dt);

		window.requestAnimationFrame(now => { this.run(now) });
	}

	draw(dt) {
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		const ortho = mat4.create();
		mat4.ortho(ortho, 0, 1280, 0, 720, 0.01, 1);

		if (!this.shader_program.ready || !this.floshed.ready)
			return;

		gl.useProgram(this.shader_program.prog);
		//this.floshed.bind();

		gl.uniformMatrix4fv(
			gl.getUniformLocation(this.shader_program.prog, 'projection'),
			false,
			ortho);

		this.test_mesh.draw(this.shader_program);
	}
}
