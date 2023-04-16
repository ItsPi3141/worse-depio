module.exports = Object.freeze([
	[
		{
			name: "Fish",
			img: "animals/fish.png",
			hp: 150,
			dmg: 20,
			speed: 1,
			boosts: 1,
			upgrade: 4000,
			heavy: false,
			canFly: false,
			buoyant: false,
			size: {
				x: 48,
				y: 68,
				multiplier: 0.9
			}
		}
	],
	[
		{
			name: "Crab",
			img: "animals/crab.png",
			hp: 150,
			dmg: 50,
			speed: 0.8,
			boosts: 1,
			upgrade: 10000,
			heavy: true,
			canFly: false,
			buoyant: false,
			size: {
				x: 58,
				y: 84,
				multiplier: 1.1
			}
		}
	],
	[
		{
			name: "Jellyfish",
			img: "animals/jellyfish.png",
			hp: 200,
			dmg: 40,
			speed: 1,
			boosts: 2,
			upgrade: 20000,
			heavy: false,
			canFly: false,
			buoyant: false,
			size: {
				x: 58,
				y: 84,
				multiplier: 1.1
			}
		}
	],
	[
		{
			name: "Squid",
			img: "animals/squid.png",
			hp: 300,
			dmg: 60,
			speed: 1,
			boosts: 2,
			upgrade: 35000,
			heavy: false,
			canFly: false,
			buoyant: false,
			size: {
				x: 64,
				y: 91,
				multiplier: 1.2
			}
		}
	],
	[
		{
			name: "Seagull",
			img: "animals/seagull.png",
			hp: 400,
			dmg: 90,
			speed: 1.05,
			boosts: 2,
			upgrade: 50000,
			heavy: false,
			canFly: true,
			buoyant: true,
			size: {
				x: 75,
				y: 106,
				multiplier: 1.4
			}
		}
	]
]);
