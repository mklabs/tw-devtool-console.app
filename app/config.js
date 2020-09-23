const path = require("path");
const Store = require("electron-store");
const { app, remote } = require("electron");
const appData = (app || remote.app).getPath('appData');
const userData = (app || remote.app).getPath('userData');

const folders = {
	troy: '',
	warhammer2: ''
};

module.exports = new Store({
	defaults: {
		window: {
			title: '',
			tabSelected: 'Console',
			error: ''
		},

		console: {
			history: []
		},

		settings: {
			selectedGame: 'troy',
			folders
		}
	}
});