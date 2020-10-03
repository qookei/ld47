import { load_file_contents } from './utils.js';
import { mat4 } from '../thirdparty/gl-matrix/index.js';

let gl_global_ = null;

export function gl() {
	return gl_global_;
}

export function set_gl(gl_) {
	gl_global_ = gl_;
}

export class Texture {
	tex = null;

	async load(url) {
		return new Promise(realise => {
			const image = new Image();
			image.onload = () => {
				this.tex = gl().createTexture();
				gl().bindTexture(gl().TEXTURE_2D, this.tex);
				gl().texImage2D(gl().TEXTURE_2D, 0, gl().RGBA,
						gl().RGBA, gl().UNSIGNED_BYTE, image);

				gl().texParameteri(gl().TEXTURE_2D, gl().TEXTURE_WRAP_S,
						gl().CLAMP_TO_EDGE);
				gl().texParameteri(gl().TEXTURE_2D, gl().TEXTURE_WRAP_T,
						gl().CLAMP_TO_EDGE);
				gl().texParameteri(gl().TEXTURE_2D, gl().TEXTURE_MIN_FILTER,
						gl().NEAREST);

				this.width_ = image.width;
				this.height_ = image.height;

				realise();
			};

			image.src = url;
		});
	}

	get width() {
		return this.width_;
	}

	get height() {
		return this.height_;
	}

	bind(slot = gl().TEXTURE0) {
		gl().activeTexture(slot);
		gl().bindTexture(gl().TEXTURE_2D, this.tex);
	}
}

async function load_shader(url, type) {
	const src = await load_file_contents(url);
	console.assert(src.status == 200);

	const shader = gl().createShader(type);

	gl().shaderSource(shader, src.content);
	gl().compileShader(shader);

	if (!gl().getShaderParameter(shader, gl().COMPILE_STATUS)) {
		console.error(gl().getShaderInfoLog(shader));
		gl().deleteShader(shader);

		return null;
	}

	return shader;
}

export class ShaderProgram {
	prog = null;

	vtx_pos_loc = -1;
	tex_pos_loc = -1;
	rgba_loc = -1;

	async load(vtx_url, frag_url) {
		const vtx = await load_shader(vtx_url, gl().VERTEX_SHADER);
		const frag = await load_shader(frag_url, gl().FRAGMENT_SHADER);

		this.prog = gl().createProgram();
		gl().attachShader(this.prog, vtx);
		gl().attachShader(this.prog, frag);
		gl().linkProgram(this.prog);

		gl().detachShader(this.prog, vtx);
		gl().deleteShader(vtx);

		gl().detachShader(this.prog, frag);
		gl().deleteShader(frag);

		if (!gl().getProgramParameter(this.prog, gl().LINK_STATUS)) {
			console.error(gl().getProgramInfoLog(this.prog));
			gl().deleteProgram(this.prog);

			return;
		}

		this.vtx_pos_loc = gl().getAttribLocation(this.prog, 'vtx_pos');
		this.tex_pos_loc = gl().getAttribLocation(this.prog, 'tex_pos');
		this.rgba_loc = gl().getAttribLocation(this.prog, 'rgba');
	}

	set_uniform_mat4(name, value) {
		gl().uniformMatrix4fv(
			gl().getUniformLocation(this.prog, name),
			false,
			value);
	}

	use() {
		gl().useProgram(this.prog);
	}
}

export class VertexObject {
	constructor() {
		this.bo = gl().createBuffer();
		this.n_vertices = 0;
	}

	load(vtx, usage = gl().STATIC_DRAW) {
		let out = [];

		for (let v of vtx) {
			const xy = v[0];
			out.push(xy[0]);
			out.push(xy[1]);

			const uv = v[1];
			out.push(uv[0]);
			out.push(uv[1]);

			const rgba = v[2];
			out.push(rgba[0]);
			out.push(rgba[1]);
			out.push(rgba[2]);
			out.push(rgba[3]);
		}

		gl().bindBuffer(gl().ARRAY_BUFFER, this.bo);
		gl().bufferData(gl().ARRAY_BUFFER, new Float32Array(out), usage);

		this.n_vertices = vtx.length;
	}

	draw(program) {
		gl().bindBuffer(gl().ARRAY_BUFFER, this.bo);
		gl().vertexAttribPointer(
			program.vtx_pos_loc,
			2, gl().FLOAT, false, 32, 0);
		gl().enableVertexAttribArray(
			program.vtx_pos_loc);

		gl().vertexAttribPointer(
			program.tex_pos_loc,
			2, gl().FLOAT, false, 32, 8);
		gl().enableVertexAttribArray(
			program.tex_pos_loc);

		gl().vertexAttribPointer(
			program.rgba_loc,
			4, gl().FLOAT, false, 32, 16);
		gl().enableVertexAttribArray(
			program.rgba_loc);

		gl().drawArrays(gl().TRIANGLES, 0, this.n_vertices);
	}
}

const projection_ = mat4.ortho(mat4.create(), 0, 1280, 720, 0, 0.1, 100);

const sprite_program_ = new ShaderProgram();

export async function load_shaders() {
	await sprite_program_.load("../res/vertex.glsl", "../res/fragment.glsl");
	sprite_program_.use();
	sprite_program_.set_uniform_mat4("projection", projection_);
}

export function sprite_program() {
	return sprite_program_;
}

export function prepare_frame(cc = [0, 0, 0, 1]) {
	gl().clearColor(cc[0], cc[1], cc[2], cc[3])
	gl().clear(gl().COLOR_BUFFER_BIT);

	gl().enable(gl().BLEND);
	gl().blendFunc(gl().SRC_ALPHA, gl().ONE_MINUS_SRC_ALPHA);
}

export class Sprite {
	constructor(w, h, texture, bo) {
		this.model_matrix = mat4.create();

		mat4.translate(this.model_matrix, this.model_matrix,
			[0.0, 0.0, -2.0]); // TODO: why do we need the -2.0???

		this.w = w;
		this.h = h;
		this.texture = texture;
		this.bo = bo;
	}

	static async new(url, x_scale = 1, y_scale = 1) {
		const tex = new Texture();
		await tex.load(url);

		const w = tex.width * x_scale, h = tex.height * y_scale;

		const bo = new VertexObject();
		bo.load([
			[ [0, 0], [0, 0], [1, 1, 1, 1] ],
			[ [w, h], [1, 1], [1, 1, 1, 1] ],
			[ [0, h], [0, 1], [1, 1, 1, 1] ],

			[ [0, 0], [0, 0], [1, 1, 1, 1] ],
			[ [w, 0], [1, 0], [1, 1, 1, 1] ],
			[ [w, h], [1, 1], [1, 1, 1, 1] ],
		]);

		return new Sprite(w, h, tex, bo);
	}

	set_position(pos) {
		mat4.translate(this.model_matrix, mat4.create(),
			[pos[0] - this.w / 2, pos[1] - this.h / 2, -6.0]);
	}

	translate(pos) {
		mat4.translate(this.model_matrix, this.model_matrix,
			pos.concat([0]));

	}

	draw() {
		this.texture.bind();
		sprite_program_.use();
		sprite_program_.set_uniform_mat4('model', this.model_matrix);
		this.bo.draw(sprite_program_);
	}
}
