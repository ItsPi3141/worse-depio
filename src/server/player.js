const ObjectClass = require("./object");
const Bullet = require("./bullet");
const Constants = require("../shared/constants");
const AnimalConstants = require("../shared/animal-constants");
const MapConstants = require("../shared/map-constants");
const Collisions = require("./collisions");
const mapCollisions = Collisions.mapCollisions;
const mapPlayerCollisions = Collisions.mapPlayerCollisions;
const isNear = Collisions.isNear;
const isPlayerNear = Collisions.isPlayerNear;

const { PLAYER_RADIUS } = Constants;

class Player extends ObjectClass {
	constructor(id, username, x, y, animal) {
		super(id, x, y, Math.random() * 2 * Math.PI, Constants.PLAYER_SPEED);
		this.username = username || "Unnamed";
		this.tier = 1;
		this.animal = animal;
		this.hp = animal.hp;
		this.dmg = this.animal.dmg;
		this.fireCooldown = 0;
		this.score = 0;
		this.boosts = animal.boosts;
	}

	// Returns a newly created bullet, or null.
	update(dt) {
		// Define animal speed
		if (this.moving == null) this.moving = true;
		var speedMultiplier = this.moving ? AnimalConstants[this.tier - 1][0].speed : 0;

		// Make sure the player stays in bounds
		this.x = Math.max(PLAYER_RADIUS * AnimalConstants[this.tier - 1][0].size.multiplier, Math.min(Constants.MAP_WIDTH - PLAYER_RADIUS * AnimalConstants[this.tier - 1][0].size.multiplier, this.x));
		this.y = Math.max(PLAYER_RADIUS * AnimalConstants[this.tier - 1][0].size.multiplier, Math.min(Constants.MAP_HEIGHT - PLAYER_RADIUS * AnimalConstants[this.tier - 1][0].size.multiplier, this.y));

		// Check for collisions with the map
		MapConstants.MAP_LINES.forEach((line) => {
			var touchingLine = isPlayerNear(this, line);
			if (touchingLine) {
				const pos = mapPlayerCollisions(this, line);
				this.x = Math.max(this.x, pos[0]);
				this.y = Math.min(this.y, pos[1]);
			}
		});

		const stats = AnimalConstants[this.tier - 1][0];

		// Check if player is out of water
		const dist = Constants.WATERLINE.y1 - this.y;
		if (dist > 0 && !stats.canFly) {
			this.thrust -= 0.4;
			if (this.directionWhenLeavingWater == null) this.directionWhenLeavingWater = this.direction;
			if (this.speedWhenLeavingWater == null) this.speedWhenLeavingWater = this.speed;
		} else {
			this.directionWhenLeavingWater = null;
			this.speedWhenLeavingWater = null;
			if (this.thrust < -10) {
				this.thrust += 10;
			} else {
				this.thrust = 0;
			}
		}
		// Move animal, also account for gravity
		this.x += dt * (this.speedWhenLeavingWater || this.speed) * speedMultiplier * Math.sin(this.directionWhenLeavingWater || this.direction);
		this.y -= dt * (this.speedWhenLeavingWater || this.speed) * speedMultiplier * Math.cos(this.directionWhenLeavingWater || this.direction) + this.thrust;

		if (stats.heavy) this.y += 2.5; // + is going down
		if (stats.buoyant && dist < 0) this.y -= 5; // - is going up

		//Evolve
		if (this.score > this.animal.upgrade && AnimalConstants.length > this.tier) {
			this.evolve();
		}

		if (this.animal.name == "Squid") {
			if (!this.moving) {
				this.hiding = true;
			} else {
				this.hiding = false;
			}
		}

		if (this.hiding) {
			if (this.startHideTime == null) {
				this.startHideTime = Date.now();
			} else {
				if (Date.now() - this.startHideTime > 500) {
					if (this.opacity > 0.3) {
						this.opacity -= 0.05;
					} else {
						this.opacity = 0.3;
					}
				}
			}
		} else {
			this.hiding = false;
			this.startHideTime = null;
			this.opacity = 1;
		}

		// Fire a bullet, if needed
		// this.fireCooldown -= dt;
		// if (this.fireCooldown <= 0) {
		//   this.fireCooldown += Constants.PLAYER_FIRE_COOLDOWN;
		//   return new Bullet(this.id, this.x, this.y, this.direction);
		// }

		// return null;
	}

	setMoving(bool) {
		if (bool != true && bool != false) return;
		this.moving = bool;
	}

	boost() {
		var speedMultiplier = AnimalConstants[this.tier - 1][0].speed;
		if (this.lastBoost == null) {
			this.lastBoost = Date.now() - 1100;
		}
		if (Date.now() - this.lastBoost > 1000) {
			if (this.boosts >= 1) {
				// No idea why it's 80 and not 90
				// If it's 90, boost veers off diagonally
				var dir = this.direction + 80;
				var xRatio = Math.cos(dir);
				var yRatio = Math.sin(dir);

				for (let i = 0; i < 200; i++) {
					setTimeout(() => {
						this.x += xRatio * (4 - i / 60) * speedMultiplier;
						this.y += yRatio * (4 - i / 60) * speedMultiplier;
					}, i);
				}

				this.lastBoost = Date.now();
				this.boosts -= 1;
			}
		}
	}

	takeBulletDamage() {
		this.hp -= Constants.BULLET_DAMAGE;
	}

	onDealtDamage() {
		this.score += Constants.SCORE_BULLET_HIT;
	}

	evolve() {
		this.tier += 1;
		const animal = AnimalConstants[this.tier - 1][0];
		this.animal = animal;
		this.hp = animal.hp;
		this.inithp = animal.hp;
		this.boosts += 1;
	}

	serializeForUpdate() {
		return {
			...super.serializeForUpdate(),
			direction: this.direction,
			hp: this.hp,
			animal: 0,
			tier: this.tier,
			score: this.score,
			username: this.username,
			boosts: this.boosts,
			opacity: this.opacity,
			hiding: this.hiding
		};
	}
}

module.exports = Player;
