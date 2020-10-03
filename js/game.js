import { Texture, ShaderProgram } from './opengl.js'

let gl = null;

export class Game {
	constructor(gl_) {
		gl = gl_;
		this.then = 0;

		this.floshed = new Texture(gl, "../res/floshed.png");
		this.shader_program = new ShaderProgram(gl, "../res/vertex.glsl", "../res/fragment.glsl");
	}

	run(now = 0) {
		now *= 0.001;
		const dt = now - this.then;
		this.then = now;

		this.draw(dt);

		window.requestAnimationFrame(now => { this.run(now) });
	}

	i = 0;

	draw(dt) {
		gl.clearColor(0, 0, this.i, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		this.shader_program.use();
		this.floshed.bind();

		this.i += dt;
		if (this.i >= 1) this.i = 0;
	}
}
