// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#3-client-entrypoints
import { connect, play, setMoving } from "./networking";
import { startRendering, stopRendering } from "./render";
import { startCapturingInput, stopCapturingInput } from "./input";
import { downloadAssets } from "./assets";
import { initState } from "./state";
import { setLeaderboardHidden } from "./leaderboard";

import "./css/main.css";

const playMenu = document.getElementById("play-menu");
const homePage = document.getElementById("home-page");
const playButton = document.getElementById("play-button");
const usernameInput = document.getElementById("username-input");
const xpBar = document.getElementById("xp-bar");
const left = document.getElementById("left");
const canvas = document.getElementById("game-canvas");
var playing = false;

Promise.all([connect(onGameOver), downloadAssets()])
	.then(() => {
		homePage.classList.remove("hidden");
		xpBar.classList.add("hidden");
		usernameInput.focus();
		homePage.addEventListener("keypress", (e) => {
			if (e.key.toLowerCase() == "enter") {
				playButton.click();
			}
		});
		window.addEventListener("keydown", (e) => {
			if (e.key.toLowerCase() == "escape") {
				setMoving(false);
				homePage.classList.remove("hidden");
			}
		});
		playButton.onclick = () => {
			// Play!
			homePage.classList.add("hidden");
			setMoving(true);
			if (playing) return;
			playing = true;
			play(usernameInput.value);
			xpBar.classList.remove("hidden");
			left.classList.remove("hidden");
			initState();
			startCapturingInput();
			startRendering();
			setLeaderboardHidden(false);
		};
	})
	.catch(console.error);

function onGameOver() {
	playing = false;
	stopCapturingInput();
	stopRendering();
	homePage.classList.remove("hidden");
	setLeaderboardHidden(true);
}
