import { gl, Texture, ShaderProgram, VertexObject } from './opengl.js';
import { mat4 } from '../thirdparty/gl-matrix/index.js';

export class Game {
	floshed = null;
	shader_program = null;
	test_mesh = null;

	async init() {
		this.floshed = new Texture("../res/floshed.png");
		this.shader_program = new ShaderProgram();
		await this.shader_program.load("../res/vertex.glsl", "../res/fragment.glsl");
		this.test_mesh = new VertexObject();
		this.test_mesh.load([
			[ [100, 100], [1, 1], [1, 1, 1, 1] ],
			[ [  0, 100], [0, 1], [1, 1, 1, 1] ],
			[ [100,   0], [1, 0], [1, 1, 1, 1] ],

			[ [100,   0], [1, 0], [1, 1, 1, 1] ],
			[ [  0,   0], [0, 0], [1, 1, 1, 1] ],
			[ [  0, 100], [0, 1], [1, 1, 1, 1] ],
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
		gl().clearColor(0, 0, 0, 1);
		gl().clear(gl().COLOR_BUFFER_BIT);

		const projection = mat4.create();
		mat4.ortho(projection, 0, 1280, 0, 720, 0.01, 100);

		const model = mat4.create();
		mat4.translate(model, model,
				[-0.0, 0.0, -2.0]);

		this.shader_program.use();
		this.floshed.bind();

		this.shader_program.set_uniform_mat4('projection', projection);
		this.shader_program.set_uniform_mat4('model', model);

		this.test_mesh.draw(this.shader_program);
	}
}
