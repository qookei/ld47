import { Game } from './game.js'

let spector = new SPECTOR.Spector();
spector.spyCanvases();
spector.displayUI();

function main() {
	const canvas = document.querySelector("#canvas");
	//const gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl2"));
	const gl = canvas.getContext("webgl");

	if (gl === null) {
		alert("Your browser may not support WebGL");
		return;
	}

	let game = new Game(gl);
	game.run();
}

window.onload = main;
