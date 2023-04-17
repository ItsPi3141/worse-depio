const ASSET_NAMES = [
	"map.svg",
	"waterline.svg",
	"sushi.png",
	"animals/fish.png",
	"animals/crab.png",
	"animals/jellyfish.png",
	"animals/squid.png",
	"animals/seagull.png",
	"animals/ray.png",
	"animals/beaver.png",
	"animals/penguin.png",
	"animals/tshark.png",
	"animals/dolphin.png",
	"animals/shark.png",
	"animals/killerwhale.png",
	"animals/whale.png"
];

const assets = {};

const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));

function downloadAsset(assetName) {
	return new Promise((resolve) => {
		const asset = new Image();
		asset.onload = () => {
			console.log(`Downloaded ${assetName}`);
			assets[assetName] = asset;
			resolve();
		};
		asset.src = `/assets/${assetName}`;
	});
}

export const downloadAssets = () => downloadPromise;

export const getAsset = (assetName) => assets[assetName];
