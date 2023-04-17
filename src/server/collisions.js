const Constants = require("../shared/constants");
const AnimalConstants = require("../shared/animal-constants");
const { PLAYER_RADIUS } = Constants;

module.exports = {
	objectCollisions: function (me) {
		const { x, y, height, width } = Constants.MAP_OBJECTS.BOX_1;
		if (me.x < x + width + me.width && me.x + me.width > x && me.y < y + height + me.height && me.y + me.height > y) {
			return true;
		} else {
			return false;
		}
	},

	isNear: function (me, obj) {
		const { x1, x2, y1, y2 } = obj;
		const x = Math.min(x1, x2);
		const width = Math.max(x1, x2);
		const y = Math.min(y1, y2);
		// const height= Math.max(y1,y2)
		if (me.x > x - 10 && me.x < width + 10 && me.y > y + 10) {
			return true;
		} else {
			return false;
		}
	},

	isPlayerNear: function (me, obj) {
		const { x1, x2, y1, y2 } = obj;
		const m = (y2 - y1) / (x2 - x1);
		const lnAngle = Math.atan(m);
		const x = Math.min(x1, x2);
		const width = Math.max(x1, x2);
		const y = Math.min(y1, y2);
		me.stats = AnimalConstants[me.tier - 1][0];

		const dir = (me.direction + 90 + lnAngle) % 360;
		const c = Math.cos(dir);
		const s = Math.sin(dir);
		const sizeX = AnimalConstants[me.tier - 1][0].size.x;
		const sizeY = AnimalConstants[me.tier - 1][0].size.y;
		if (sizeX * Math.abs(s) < sizeY * Math.abs(c)) {
			xCoor = (Math.sign(c) * sizeX) / 2;
			yCoor = Math.tan(dir) * xCoor;
		} else {
			yCoor = (Math.sign(s) * sizeY) / 2;
			xCoor = (1 / Math.tan(dir)) * yCoor; // 1 / Math.tan() is for cotangent
		}

		const calcPlayerRadius = Math.sqrt(xCoor ** 2 + yCoor ** 2);

		// if (me.x > x - 15 && me.x < width + 15 && me.y > y - PLAYER_RADIUS * AnimalConstants[me.tier - 1][0].size.multiplier) {
		if (me.x > x - 5 && me.x < width + 5 && me.y > y - calcPlayerRadius) {
			return true;
		} else {
			return false;
		}
	},

	// Returns an array of bullets to be destroyed.
	applyCollisions: function (players, bullets) {
		const destroyedBullets = [];
		for (let i = 0; i < bullets.length; i++) {
			// Look for a player (who didn't create the bullet) to collide each bullet with.
			// As soon as we find one, break out of the loop to prevent double counting a bullet.
			for (let j = 0; j < players.length; j++) {
				const bullet = bullets[i];
				const player = players[j];
				if (bullet.parentID !== player.id && player.distanceTo(bullet) <= Constants.PLAYER_RADIUS + Constants.BULLET_RADIUS) {
					destroyedBullets.push(bullet);
					player.takeBulletDamage();
					break;
				}
			}
		}
		return destroyedBullets;
	},

	mapCollisions: function (me, obj) {
		const { x1, x2, y1, y2 } = obj;
		const m = (y2 - y1) / (x2 - x1);
		if (m < 1) {
			const c1 = y1 - m * x1;
			const dy = me.x * m + c1;
			return [me.x, dy];
		}
		if (m > 1) {
			const c2 = x1 - y1 / m;
			const dx = me.y / m + c2;
			return [dx, me.y];
		}
		return [me.x, me.y];
	},

	// mapPlayerCollisions: function (me, obj, xFac, yFac) {
	// 	me.stats = AnimalConstants[me.tier - 1][0];
	// 	const { x1, x2, y1, y2 } = obj;
	// 	const m = (y2 - y1) / (x2 - x1);
	// 	me.x = me.x + (me.stats.size.x / 2) * xFac;
	// 	me.y = me.y + (me.stats.size.y / 2) * yFac;
	// 	if (m < 1) {
	// 		const c1 = y1 - m * x1;
	// 		const dy = me.x * m + c1;
	// 		return [me.x, dy];
	// 	}
	// 	if (m > 1) {
	// 		const c2 = x1 - y1 / m;
	// 		const dx = me.y / m + c2;
	// 		return [dx, me.y];
	// 	}
	// 	return [me.x, me.y];
	// }
	mapPlayerCollisions: function (me, obj) {
		const { x1, x2, y1, y2 } = obj;
		const m = (y2 - y1) / (x2 - x1);
		const lnAngle = Math.atan(m);

		const dir = (me.direction + 90 + lnAngle) % 360;
		const c = Math.cos(dir);
		const s = Math.sin(dir);
		const sizeX = AnimalConstants[me.tier - 1][0].size.x;
		const sizeY = AnimalConstants[me.tier - 1][0].size.y;
		if (sizeX * Math.abs(s) < sizeY * Math.abs(c)) {
			xCoor = (Math.sign(c) * sizeX) / 2;
			yCoor = Math.tan(dir) * xCoor;
		} else {
			yCoor = (Math.sign(s) * sizeY) / 2;
			xCoor = (1 / Math.tan(dir)) * yCoor; // 1 / Math.tan() is for cotangent
		}

		const calcPlayerRadius = Math.sqrt(xCoor ** 2 + yCoor ** 2);

		if (m < 1) {
			const c1 = y1 - m * x1;
			// const dy = me.x * m + c1 - PLAYER_RADIUS * AnimalConstants[me.tier - 1][0].size.multiplier * 0.9;
			const dy = me.x * m + c1 - calcPlayerRadius;
			return [me.x, dy];
		}
		if (m > 1) {
			const c2 = x1 - y1 / m;
			// const dx = me.y / m + c2 + PLAYER_RADIUS * AnimalConstants[me.tier - 1][0].size.multiplier * 0.9;
			const dx = me.y / m + c2 + calcPlayerRadius;
			return [dx, me.y];
		}
		return [me.x, me.y];
	}
};
