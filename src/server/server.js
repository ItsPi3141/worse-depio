const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const socketio = require("socket.io");

const Constants = require("../shared/constants");
const Game = require("./game");
const webpackConfig = require("../../webpack.dev.js");
const path = require("path");

// Setup an Express server
const app = express();
app.use(express.static("public"));

if (process.env.NODE_ENV === "development") {
	// Setup Webpack for development
	const compiler = webpack(webpackConfig);
	app.use(webpackDevMiddleware(compiler));
} else {
	// Static serve the dist/ folder in production
	app.use(express.static("dist"));
}

// Listen on port
const port = process.env.PORT || 3000;
const server = app.listen(port, "0.0.0.0");
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io = socketio(server);

// Listen for socket.io connections
io.on("connection", (socket) => {
	console.log("Player connected!", socket.id);

	socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
	socket.on(Constants.MSG_TYPES.INPUT, handleInput);
	socket.on(Constants.MSG_TYPES.BOOST, handleBoost);
	socket.on(Constants.MSG_TYPES.SET_MOVING, handleSetMoving);
	socket.on("disconnect", onDisconnect);
});

// Setup the Game
const game = new Game();

function joinGame(username) {
	game.addPlayer(this, username.trim().substring(0, 69));
}

function handleInput(dir) {
	game.handleInput(this, dir);
}

function handleBoost() {
	game.handleBoost(this);
}

function handleSetMoving(bool) {
	game.handleSetMoving(this, bool);
}

function onDisconnect() {
	game.removePlayer(this);
}
