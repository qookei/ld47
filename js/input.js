const key_map = {
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down',
	65: 'a',
	68: 'd'
}

const state_ = {};

export function init_input() {
	window.addEventListener("keydown", event => state_[key_map[event.keyCode]] = true);
	window.addEventListener("keyup", event => state_[key_map[event.keyCode]] = false);
}

export function is_key_down(key) {
	return state_[key];
}
