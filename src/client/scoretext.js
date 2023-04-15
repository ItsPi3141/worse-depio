export function humanReadableScore(score) {
	if (score < 1000) return Math.round(score);
	if (score < 1000000) {
		var readableScore = Math.round(score / 100) / 10;
		if (readableScore.toString().match(/\.[0-9]/) == null) {
			readableScore = readableScore.toString() + ".0";
		}
		return readableScore + "k";
	} else {
		var readableScore = Math.round(score / 1000) / 1000;
		if (readableScore.toString().match(/\.[0-9]/) == null) {
			readableScore = readableScore.toString() + ".000";
		} else if (readableScore.toString().match(/\.[0-9]{2}/) == null) {
			readableScore = readableScore.toString() + "00";
		} else if (readableScore.toString().match(/\.[0-9]{3}/) == null) {
			readableScore = readableScore.toString() + "0";
		}
		return readableScore + "M";
	}
}
