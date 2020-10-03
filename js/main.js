import { set_gl } from "./opengl.js";
import { Game } from "./game.js";

main();

async function main() {
	const canvas = document.querySelector("#canvas");
	const gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl2"));
	//const gl = canvas.getContext("webgl2");

	if (!gl) {
		alert("Failed to create a WebGL context. Perhaps try a more up to date browser?");
		return;
	}

	set_gl(gl);

	const game = new Game();
	await game.init();

	game.run();
}
