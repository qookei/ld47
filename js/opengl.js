import { load_file_contents } from './utils.js';

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

		//	gl.detachShader(this.prog, vtx);
		//	gl.deleteShader(vtx);

		//	gl.detachShader(this.prog, frag);
		//	gl.deleteShader(frag);

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

	store(data, usage) {
		this.bind();
		this.gl.bufferData(this.type, data, usage);
	}
}

export class Mesh {
	constructor(gl) {
		this.gl = gl;
		this.xyz_bo = gl.createBuffer();
		this.uvw_bo = gl.createBuffer();
		this.rgba_bo = gl.createBuffer();
		this.n_vertices = 0;
	}

	set_vertices(vtx, usage = this.gl.STATIC_DRAW) {
		let out_xyz = [];
		let out_uvw = [];
		let out_rgba = [];

		for (let v in vtx) {
			out_xyz.push(v[0]);
			out_xyz.push(v[1]);
			out_xyz.push(v[2]);

			out_uvw.push(v[3]);
			out_uvw.push(v[4]);
			out_uvw.push(v[5]);

			out_rgba.push(v[6]);
			out_rgba.push(v[7]);
			out_rgba.push(v[8]);
			out_rgba.push(v[9]);
		}

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.xyz_bo);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(out_xyz), usage);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvw_bo);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(out_uvw), usage);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rgba_bo);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(out_rgba), usage);

		this.n_vertices = vtx.length;
	}

	draw(prog) {
		const vtx_pos_loc = this.gl.getAttribLocation(prog.prog, "vtx_pos");
		const tex_coords_loc = this.gl.getAttribLocation(prog.prog, "tex_coords");
		const rgba_loc = this.gl.getAttribLocation(prog.prog, "rgba");

		console.assert(vtx_pos_loc !== -1, "fuck 1");
		console.assert(tex_coords_loc !== -1, "fuck 2");
		console.assert(rgba_loc !== -1, "fuck 3");

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.xyz_bo);
		this.gl.vertexAttribPointer(
			vtx_pos_loc,
			3,
			this.gl.FLOAT,
			false,
			12,
			0);
		this.gl.enableVertexAttribArray(vtx_pos_loc);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvw_bo);
		this.gl.vertexAttribPointer(
			tex_coords_loc,
			3,
			this.gl.FLOAT,
			false,
			12,
			0);
		this.gl.enableVertexAttribArray(tex_coords_loc);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rgba_bo);
		this.gl.vertexAttribPointer(
			rgba_loc,
			4,
			this.gl.FLOAT,
			false,
			12,
			0);
		this.gl.enableVertexAttribArray(rgba_loc);

		this.gl.drawArrays(this.gl.TRIANGLES, 0, this.n_vertices);
	}
}
