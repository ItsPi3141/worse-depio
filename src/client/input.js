// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import { boost, updateDirection, setMoving } from "./networking";
import { getZoomRatio } from "./render";
const Constants = require("../shared/constants");

function onMouseInput(e) {
	handleInput(e.clientX, e.clientY);
}

function onTouchInput(e) {
	const touch = e.touches[0];
	handleInput(touch.clientX, touch.clientY);
}

function onClick() {
	boost();
}

function handleInput(x, y) {
	const dir = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
	if (Math.sqrt((x - window.innerWidth / 2) ** 2 + (window.innerHeight / 2 - y) ** 2) < 30 / getZoomRatio() || document.querySelector("#home-page:not(.hidden)")) {
		setMoving(false);
	} else {
		setMoving(true);
	}
	updateDirection(dir);
}

export function startCapturingInput() {
	window.addEventListener("mousemove", onMouseInput);
	window.addEventListener("click", onClick);
	window.addEventListener("touchstart", onTouchInput);
	window.addEventListener("touchmove", onTouchInput);
}

export function stopCapturingInput() {
	window.removeEventListener("mousemove", onMouseInput);
	window.removeEventListener("click", onClick);
	window.removeEventListener("touchstart", onTouchInput);
	window.removeEventListener("touchmove", onTouchInput);
}
