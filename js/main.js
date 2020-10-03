import { Game } from './game.js'

function main() {
	const canvas = document.querySelector("#canvas");
	const gl = canvas.getContext("webgl");

	if (gl === null) {
		alert("Your browser may not support WebGL");
		return;
	}

	let game = new Game(gl);
	game.run();
}

window.onload = main;
