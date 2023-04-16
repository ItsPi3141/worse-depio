const Constants = require("../shared/constants");
const AnimalConstants = require("../shared/animal-constants");
const Player = require("./player");
const Xp = require("./xp");
const Collisions = require("./collisions");
const applyCollisions = Collisions.applyCollisions;
const isNear = Collisions.isNear;
const MapConstants = require("../shared/map-constants");
const mapCollisions = Collisions.mapCollisions;

class Game {
	constructor() {
		this.sockets = {};
		this.players = {};
		this.bullets = [];
		this.xp = [];
		this.return = {};
		this.lastUpdateTime = Date.now();
		this.shouldSendUpdate = false;
		setInterval(this.update.bind(this), 1000 / 60);
	}

	generateXp() {
		if (this.xp.length < 100) {
			const xp = new Xp();
			this.xp.push(xp);
			xp.verify();
		}
	}

	addPlayer(socket, username) {
		this.sockets[socket.id] = socket;

		// Generate a position to start this player at.
		const x = Constants.MAP_WIDTH * (0.25 + Math.random() * 0.5);
		const y = Constants.MAP_HEIGHT * (0.25 + Math.random() * 0.5);
		this.players[socket.id] = new Player(socket.id, username, x, y, AnimalConstants[0][0]);
	}

	removePlayer(socket) {
		delete this.sockets[socket.id];
		delete this.players[socket.id];
	}

	handleInput(socket, dir) {
		if (this.players[socket.id]) {
			this.players[socket.id].setDirection(dir);
		}
	}

	handleBoost(socket) {
		if (this.players[socket.id]) {
			this.players[socket.id].boost();
		}
	}

	handleSetMoving(socket, bool) {
		if (this.players[socket.id]) {
			this.players[socket.id].setMoving(bool);
		}
	}

	update() {
		// Calculate time elapsed
		const now = Date.now();
		const dt = (now - this.lastUpdateTime) / 1000;
		this.lastUpdateTime = now;

		// Update each bullet
		const bulletsToRemove = [];
		this.bullets.forEach((bullet) => {
			if (bullet.update(dt)) {
				// Destroy this bullet
				bulletsToRemove.push(bullet);
			}
		});
		this.bullets = this.bullets.filter((bullet) => !bulletsToRemove.includes(bullet));

		//Update Xp
		this.generateXp();

		// Make sushi sink
		this.xp.forEach((xp) => {
			if (xp.type == 2) {
				if (!xp.settled) xp.y += 1;
				MapConstants.MAP_LINES.forEach((line) => {
					if (isNear(xp, line)) {
						const pos = mapCollisions(xp, line);
						xp.x = Math.max(xp.x, pos[0]);
						let slope = 1 / ((line.x2 - line.x1) / (line.y2 - line.y1));
						xp.y = Math.min(xp.y, pos[1] - 20 * slope);
						xp.settled = true;
					}
				});
			}
		});

		const xpToRemove = [];
		Object.keys(this.sockets).forEach((playerID) => {
			const me = this.players[playerID];
			this.xp.forEach((xp) => {
				if (me.distanceTo(xp) < Constants.PLAYER_RADIUS * AnimalConstants[me.tier - 1][0].size.multiplier && !me.hiding) {
					if (xp.type == 0 || xp.type == 1) {
						me.score += 200;
						me.boosts = Math.min(me.boosts + 0.15, AnimalConstants[me.tier - 1][0].boosts);
					} else if (xp.type == 2) {
						me.score += 2000;
						me.boosts = Math.min(me.boosts + 0.2, AnimalConstants[me.tier - 1][0].boosts);
					} else {
						me.score += 50;
						me.boosts = Math.min(me.boosts + 0.1, AnimalConstants[me.tier - 1][0].boosts);
					}
					xpToRemove.push(xp);
				}
			});
		});
		this.xp = this.xp.filter((xp) => !xpToRemove.includes(xp));

		// Update each player
		Object.keys(this.sockets).forEach((playerID) => {
			const player = this.players[playerID];
			const newBullet = player.update(dt);
			if (newBullet) {
				this.bullets.push(newBullet);
			}
		});

		// Apply collisions, give players score for hitting bullets
		const destroyedBullets = applyCollisions(Object.values(this.players), this.bullets);
		destroyedBullets.forEach((b) => {
			if (this.players[b.parentID]) {
				this.players[b.parentID].onDealtDamage();
			}
		});
		this.bullets = this.bullets.filter((bullet) => !destroyedBullets.includes(bullet));

		// Check if any players are dead
		Object.keys(this.sockets).forEach((playerID) => {
			const socket = this.sockets[playerID];
			const player = this.players[playerID];
			if (player.hp <= 0) {
				socket.emit(Constants.MSG_TYPES.GAME_OVER);
				this.removePlayer(socket);
			}
		});

		// Send a game update to each player every other time
		if (this.shouldSendUpdate) {
			const leaderboard = this.getLeaderboard();
			Object.keys(this.sockets).forEach((playerID) => {
				const socket = this.sockets[playerID];
				const player = this.players[playerID];
				socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player, leaderboard));
			});
			this.shouldSendUpdate = false;
		} else {
			this.shouldSendUpdate = true;
		}
	}

	getLeaderboard() {
		return Object.values(this.players)
			.sort((p1, p2) => p2.score - p1.score)
			.slice(0, 5)
			.map((p) => ({ username: p.username, score: Math.round(p.score) }));
	}

	createUpdate(player, leaderboard) {
		const nearbyPlayers = Object.values(this.players).filter((p) => p !== player && p.distanceTo(player) <= Constants.MAP_WIDTH / 2);
		const nearbyBullets = this.bullets.filter((b) => b.distanceTo(player) <= Constants.MAP_WIDTH / 2);
		const nearbyXp = this.xp.filter((x) => x.distanceTo(player) <= Constants.MAP_WIDTH / 2);

		return {
			t: Date.now(),
			me: player.serializeForUpdate(),
			others: nearbyPlayers.map((p) => p.serializeForUpdate()),
			bullets: nearbyBullets.map((b) => b.serializeForUpdate()),
			xp: nearbyXp.map((x) => x.serializeForUpdate()),
			return: this.players,
			leaderboard
		};
	}
}

module.exports = Game;
