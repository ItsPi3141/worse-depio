const shortid = require("shortid");
const ObjectClass = require("./object");
const Constants = require("../shared/constants");
const MapConstants = require("../shared/map-constants");
const Collisions = require("./collisions");
const mapCollisions = Collisions.mapCollisions;
const isNear = Collisions.isNear;

const { MAP_WIDTH, MAP_HEIGHT } = Constants;
const WATERLINE = Constants.WATERLINE.y1;

class Xp extends ObjectClass {
	constructor(type) {
		var foodType = type;
		super(shortid(), MAP_WIDTH * Math.random(), type == 3 ? MAP_HEIGHT - 15 : (MAP_HEIGHT - WATERLINE) * Math.random() + WATERLINE, Math.PI, foodType == 2 ? 2 : null, foodType);
	}

	verify(type) {
		var canPlace = true;
		MapConstants.MAP_LINES.forEach((line) => {
			if (isNear(this, line)) {
				if (type == 3) {
					const pos = mapCollisions(this, line);
					this.x = Math.max(this.x, pos[0]);
					this.y = Math.min(this.y, pos[1]);
					// this.type = 3;
					canPlace = true;
				} else {
					canPlace = false;
				}
			}
		});
		return canPlace;
	}

	serializeForUpdate() {
		return {
			id: this.id,
			x: this.x,
			y: this.y,
			type: this.type
		};
	}
}

module.exports = Xp;
