import { load_file_contents } from './utils.js'

export class Texture {
	constructor(gl, url) {
		this.gl = gl;
		this.ready = false;

		this.tex = null;

		const image = new Image();
		image.onload = () => {
			this.tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.tex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
					gl.RGBA, gl.UNSIGNED_BYTE, image);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,
					gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,
					gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
					gl.NEAREST);

			this.width_ = image.width;
			this.height_ = image.height;
			this.ready = true;
		};

		image.src = url;
	}

	width() {
		if (!this.ready)
			return 0;
		return this.width_;
	}

	height() {
		if (!this.ready)
			return 0;
		return this.height_;
	}

	bind(slot = this.gl.TEXTURE0) {
		if (!this.ready) {
			console.log("Texture is not ready yet")
			return;
		}

		this.gl.activeTexture(slot);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
	}
}

async function load_shader(gl, url, type) {
	const src = await load_file_contents(url);
	console.assert(src.status == 200);

	const shader = gl.createShader(type);

	gl.shaderSource(shader, src.content);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);

		return null;
	}

	return shader;
}

export class ShaderProgram {
	async load_shaders_(vtx_url, frag_url) {
		return [
			await load_shader(this.gl, vtx_url, this.gl.VERTEX_SHADER),
			await load_shader(this.gl, frag_url, this.gl.FRAGMENT_SHADER)
		];
	}

	constructor(gl, vtx_url, frag_url) {
		this.gl = gl;
		this.ready = false;
		this.prog = null;

		this.load_shaders_(vtx_url, frag_url).then(([vtx, frag]) => {
			this.prog = gl.createProgram();
			gl.attachShader(this.prog, vtx);
			gl.attachShader(this.prog, frag);
			gl.linkProgram(this.prog);

			gl.detachShader(this.prog, vtx);
			gl.deleteShader(vtx);

			gl.detachShader(this.prog, frag);
			gl.deleteShader(frag);

			if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
				console.error(gl.getProgramInfoLog(this.prog));
				gl.deleteProgram(this.prog);

				return;
			}

			this.ready = true;
		});
	}

	use() {
		if (!this.ready) {
			console.log("Shader program is not ready yet")
			return;
		}

		this.gl.useProgram(this.prog);
	}
}

export class Buffer {
	bind() {
		this.gl.bindBuffer(this.type, this.buffer);
	}

	constructor(gl, type) {
		this.gl = gl;
		this.type = type;

		this.buffer = gl.createBuffer();
	}

	store(data, usage = this.gl.STATIC_DRAW) {
		this.bind();
		this.gl.bufferData(this.type, data, usage);
	}
}

export class Vertex {
	
}

export class Mesh {

}
