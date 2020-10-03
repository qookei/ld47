import { prepare_frame, Sprite } from './opengl.js';
import { is_key_down } from './input.js';

export class Game {
	floshed1 = null;
	floshed2 = null;

	async init() {
		this.floshed1 = await Sprite.new("../res/floshed.png");
		this.floshed2 = await Sprite.new("../res/floshed.png", 0.5, 0.5);
	}

	t = 0;
	x = 200; y = 200; orbit = 200;
	update(dt) {
		if (is_key_down('right')) this.x += dt * 100;
		if (is_key_down('left')) this.x -= dt * 100;
		if (is_key_down('down')) this.y += dt * 100;
		if (is_key_down('up')) this.y -= dt * 100;
		if (is_key_down('a')) this.orbit -= dt * 100;
		if (is_key_down('d')) this.orbit += dt * 100;

		if (this.orbit < 0) this.orbit = 0;

		this.floshed1.set_position([
				Math.cos(this.t) * this.orbit + this.x,
				Math.sin(this.t) * this.orbit + this.y
			]);

		this.floshed2.set_position([this.x, this.y]);

		this.t += dt;
	}

	draw() {
		prepare_frame();
		this.floshed1.draw();
		this.floshed2.draw();
	}
}
