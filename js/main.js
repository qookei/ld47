import { set_gl, load_shaders } from "./opengl.js";
import { Game } from "./game.js";
import { init_input } from "./input.js";

window.onload = () => { main(); };

async function main() {
	const canvas = document.querySelector("#canvas");
	//const gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl2"));
	const gl = canvas.getContext("webgl2", { depth: false, premultipliedAlpha: false, desynchronized: true });

	if (!gl) {
		alert("Failed to create a WebGL context. Perhaps try a more up to date browser?");
		return;
	}

	set_gl(gl);

	await load_shaders();
	init_input();

	const game = new Game();
	await game.init();
	await run(game);
}

async function run(game) {
	let now = 0;
	let then = 0;

	while (true) {
		game.update(now - then);
		game.draw();

		then = now;
		now = await new Promise(realise => {
			window.requestAnimationFrame(now => realise(now * 0.001));
		});
	}
}
