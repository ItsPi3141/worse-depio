// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import { debounce } from "throttle-debounce";
import { getAsset } from "./assets";
import { getCurrentState } from "./state";
const AnimalConstants = require("../shared/animal-constants");
import { humanReadableScore } from "./scoretext";

var count = document.getElementById("count");

const Constants = require("../shared/constants");

const { PLAYER_RADIUS, BULLET_RADIUS, MAP_WIDTH, MAP_HEIGHT } = Constants;

// Get the canvas graphics context
const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");
const xpBar = document.querySelector("#xp-bar .inner");

const boostBar1 = document.querySelector("#boost-bar-1");
const boostBar2 = document.querySelector("#boost-bar-2");
const boostBar3 = document.querySelector("#boost-bar-3");
const boostBar4 = document.querySelector("#boost-bar-4");

var zoomRatio = 0.4;
canvas.addEventListener("wheel", (e) => {
	if (checkScrollDirection(e) == "up") {
		if (zoomRatio == 0.51315811823070675574202125080136) return;
		zoomRatio = Math.max(zoomRatio / 1.1, 0.51315811823070675574202125080136);
	} else {
		if (zoomRatio == 2.5937424601) return;
		zoomRatio = Math.min(zoomRatio * 1.1, 2.5937424601);
	}
	setCanvasDimensions();
});

export function getZoomRatio() {
	return zoomRatio;
}

function checkScrollDirection(event) {
	if (checkScrollDirectionIsUp(event)) {
		return "up";
	} else {
		return "down";
	}
}

function checkScrollDirectionIsUp(event) {
	if (event.wheelDelta) {
		return event.wheelDelta > 0;
	}
	return event.deltaY < 0;
}

setCanvasDimensions();

function setCanvasDimensions() {
	var tempCanvas = document.createElement("canvas");
	tempCanvas.width = context.canvas.width;
	tempCanvas.height = context.canvas.height;
	var tempContext = tempCanvas.getContext("2d");

	tempContext.drawImage(context.canvas, 0, 0);

	// On small screens (e.g. phones), we want to "zoom out" so players can still see at least
	// 800 in-game units of width.
	const scaleRatio = Math.max(1, 800 / window.innerWidth);
	canvas.width = scaleRatio * window.innerWidth * 2 * zoomRatio;
	canvas.height = scaleRatio * window.innerHeight * 2 * zoomRatio;

	context.drawImage(tempContext.canvas, 0, 0);
}

window.addEventListener("resize", debounce(40, setCanvasDimensions));

function render() {
	const { me, others, bullets, xp, info } = getCurrentState();
	me.stats = AnimalConstants[me.tier - 1][me.animal];
	others.forEach((o) => {
		o.stats = AnimalConstants[o.tier - 1][o.animal];
	});
	if (!me) {
		return;
	}

	// Draw background
	renderBackground(me.x, me.y);
	xp.forEach((index) => renderXp(me, index));
	renderXpBar(me);
	renderText(me);
	renderBoostBar(me);

	// Draw boundaries
	// context.strokeStyle = "black";
	// context.lineWidth = 1;
	// context.strokeRect(canvas.width / 2 - me.x, canvas.height / 2 - me.y, MAP_WIDTH, MAP_HEIGHT);

	// Draw all bullets
	// bullets.forEach(renderBullet.bind(null, me));

	// Draw all players
	renderPlayer(me, me);
	others.forEach(renderPlayer.bind(null, me));

	// Render waterline on top of everything
	renderWaterline(me.x, me.y);
}

function renderText(me) {
	const score = Math.round(me.score);
	const stats = me.stats.upgrade;
	if (AnimalConstants.length > me.tier) {
		count.innerHTML = humanReadableScore(score) + " xp out of " + humanReadableScore(stats) + " xp (" + humanReadableScore(stats - score) + " xp until next animal)";
	} else {
		count.innerHTML = me.stats.name + " is the latest animal";
	}
}

function renderBackground(x, y) {
	context.fillStyle = "#12171f";
	context.fillRect(0, 0, canvas.width, canvas.height);
	const mapX = 0 - x + canvas.width / 2;
	const mapY = 0 - y + canvas.height / 2;
	context.drawImage(getAsset("map.svg"), mapX, mapY, MAP_WIDTH, MAP_HEIGHT);
	context.restore();
}

function renderWaterline(x, y) {
	context.fillStyle = "transparent";
	context.fillRect(0, 0, canvas.width, canvas.height);
	const mapX = 0 - x + canvas.width / 2;
	const mapY = 0 - y + canvas.height / 2;
	context.drawImage(getAsset("waterline.svg"), mapX, mapY, MAP_WIDTH, MAP_HEIGHT);
	context.restore();
}

// Renders a player at the given coordinates
function renderPlayer(me, player) {
	window.me = me;
	window.player = player;
	const { x, y, direction } = player;
	const canvasX = canvas.width / 2 + x - me.x;
	const canvasY = canvas.height / 2 + y - me.y;

	context.save();
	context.translate(canvasX, canvasY);
	context.rotate(direction);
	context.globalAlpha = player.opacity;
	context.drawImage(getAsset(player.stats.img), player.stats.size.x / -2, player.stats.size.y / -2, player.stats.size.x, player.stats.size.y);
	context.globalAlpha = 1;
	context.restore();

	// Draw XP text
	context.font = "20px Quicksand";
	context.fillStyle = "#dddddd";
	context.textAlign = "center";
	var score = humanReadableScore(player.score);
	context.fillText(score, canvasX, canvasY - PLAYER_RADIUS - 25);

	// Draw username
	context.font = "25px Quicksand";
	context.fillStyle = "#ffffff";
	context.textAlign = "center";
	context.fillText(player.username, canvasX, canvasY - PLAYER_RADIUS - 50);

	// Draw health bar
	if (player.hp < player.stats.hp) {
		context.fillStyle = "lime";
		context.fillRect(canvasX - PLAYER_RADIUS, canvasY - PLAYER_RADIUS - 10, PLAYER_RADIUS * 2, 10);
		context.fillStyle = "red";
		context.fillRect(canvasX - PLAYER_RADIUS + (PLAYER_RADIUS * 2 * player.hp) / player.stats.hp, canvasY - PLAYER_RADIUS - 10, PLAYER_RADIUS * 2 * (1 - player.hp / player.stats.hp), 10);
	}
}

function renderXpBar(me) {
	// context.fillStyle = "#fff4";
	// context.fillRect(100, canvas.height - 75, canvas.width - 200, 20);
	// context.fillStyle = "yellow";
	// context.fillRect(100, canvas.height - 75, (canvas.width - 200) * (me.score / me.stats.upgrade), 20);
	xpBar.style.transform = `scaleX(${Math.min(me.score / me.stats.upgrade, 1)})`;
}

function renderBoostBar(me) {
	me.stats = AnimalConstants[me.tier - 1][0];
	if (me.stats.boosts <= 1) {
		boostBar1.style.display = "";
		boostBar2.style.display = "none";
		boostBar3.style.display = "none";
		boostBar4.style.display = "none";
	} else if (me.stats.boosts <= 2) {
		boostBar1.style.display = "";
		boostBar2.style.display = "";
		boostBar3.style.display = "none";
		boostBar4.style.display = "none";
	} else if (me.stats.boosts <= 3) {
		boostBar1.style.display = "";
		boostBar2.style.display = "";
		boostBar3.style.display = "";
		boostBar4.style.display = "none";
	} else if (me.stats.boosts <= 4) {
		boostBar1.style.display = "";
		boostBar2.style.display = "";
		boostBar3.style.display = "";
		boostBar4.style.display = "";
	}
	var fullBoosts = Math.floor(me.boosts);
	var leftOver = me.boosts - Math.floor(me.boosts);
	for (let i = 1; i <= fullBoosts; i++) {
		document.querySelector(`#boost-bar-${i} .inner`).style.transform = "scaleY(1)";
		document.querySelector(`#boost-bar-${i} .inner`).style.backgroundColor = "lime";
	}
	for (let i = 4; i > Math.ceil(me.boosts); i--) {
		document.querySelector(`#boost-bar-${i} .inner`).style.transform = "scaleY(0)";
		document.querySelector(`#boost-bar-${i} .inner`).style.backgroundColor = "skyblue";
	}
	document.querySelector(`#boost-bar-${fullBoosts + 1} .inner`).style.transform = `scaleY(${leftOver})`;
	document.querySelector(`#boost-bar-${fullBoosts + 1} .inner`).style.backgroundColor = "skyblue";
}

function renderBullet(me, bullet) {
	const { x, y } = bullet;
	context.drawImage(getAsset("bullet.svg"), canvas.width / 2 + x - me.x - BULLET_RADIUS, canvas.height / 2 + y - me.y - BULLET_RADIUS, BULLET_RADIUS * 2, BULLET_RADIUS * 2);
}

function renderXp(me, xp) {
	const { x, y, type } = xp;
	const xpX = x - me.x + canvas.width / 2;
	const xpY = y - me.y + canvas.height / 2;
	if (type != 2) {
		let innerColor,
			outerColor = "";
		switch (type) {
			case 0:
				innerColor = "#569c11";
				outerColor = "#84a915";
				break;

			case 1:
				innerColor = "#14cccc";
				outerColor = "#5ce6e6";
				break;

			case 3:
				innerColor = "#ff99aa";
				outerColor = "#ff99aa";
				break;
		}
		context.fillStyle = outerColor;
		context.beginPath();
		context.arc(xpX, xpY, 15, 0, 2 * Math.PI);
		context.fill();
		context.fillStyle = innerColor;
		context.beginPath();
		context.arc(xpX, xpY, 7, 0, 2 * Math.PI);
		context.fill();
	} else {
		context.drawImage(getAsset("sushi.png"), xpX, xpY);
	}
}

function renderMainMenu() {
	const t = Date.now() / 7500;
	const x = MAP_WIDTH / 2 + 800 * Math.cos(t);
	const y = MAP_HEIGHT / 2 + 800 * Math.sin(t);
	renderBackground(x, y);
}

let renderInterval = setInterval(renderMainMenu, 1000 / 60);

// Replaces main menu rendering with game rendering.
export function startRendering() {
	zoomRatio = 1;
	setCanvasDimensions();
	clearInterval(renderInterval);
	renderInterval = setInterval(render, 1000 / 60);
}

// Replaces game rendering with main menu rendering.
export function stopRendering() {
	zoomRatio = 0.4;
	clearInterval(renderInterval);
	renderInterval = setInterval(renderMainMenu, 1000 / 60);
}
