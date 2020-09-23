const log = debug("store");
const fs = require("fs");
const path = require("path");
const Spruce = require("@ryangjchandler/spruce");
const config = require("../config");
const { closeWatcher, initWatcher } = require("./watchConsole");
const { copyModFolder } = require("./utils");

const gameExecutables = {
    troy: "Troy.exe",
    warhammer2: "Warhammer2.exe"
};

function validateGamePath(filepath) {
    if (!fs.existsSync(filepath)) {
        Spruce.store("window").error =`${filepath} is not a valid folder.`;
        return false;
    }

    const selectedGame = Spruce.store("settings").selectedGame;
    const exe = gameExecutables[selectedGame];
    if (!fs.existsSync(path.join(filepath, exe))) {
        Spruce.store("window").error =`Cannot locate game executable ${exe}, is it a valid folder ? (${filepath})`;
        return false;
    }

    return true;
}

Spruce.store("console", { messages: [], scriptFolder: '' });
Spruce.store("window", config.store.window);
Spruce.store("settings", config.store.settings);

Spruce.on("init", async () => {
    const selectedGame = Spruce.store("settings").selectedGame;
    const folders = Spruce.store("settings").folders;
    const gamePath = folders[selectedGame];
    const scriptFolder = `${path.join(gamePath, 'data/script')}`;

    Spruce.store("console").scriptFolder = scriptFolder;

    if (!validateGamePath(gamePath)) {
        return;
    }
    
    await copyModFolder(gamePath);
    await closeWatcher();
    initWatcher(scriptFolder);
});

Spruce.watch("window.tabSelected", (value) => {
    config.set("window.tabSelected", value);
});

Spruce.watch("window.error", (value) => {
    config.set("window.error", value);
});

Spruce.watch("console.scriptFolder", async (value) => {
    const gamePath = path.resolve(value, "../..");

    if (!validateGamePath(gamePath)) {
        return;
    }

    Spruce.store("window").error =``;
    log("script folder changed update watcher");

    await copyModFolder(gamePath);
    await closeWatcher();
    initWatcher(value);
});

Spruce.watch("settings.selectedGame", (value) => {
    const folders = Spruce.store("settings").folders;
    Spruce.store("console").scriptFolder = `${path.join(folders[value], 'data/script')}`;

    config.set("settings.selectedGame", value);
});

Object.keys(config.store.settings.folders).forEach(folder => {
    Spruce.watch(`settings.folders.${folder}`, (value) => {
        config.set(`settings.folders.${folder}`, value);

        if (!value) {
            return;
        }

        const selectedGame = Spruce.store("settings").selectedGame;
        if (selectedGame === folder) {
            Spruce.store("console").scriptFolder = `${path.join(value, 'data/script')}`
        }
    });
});

module.exports = Spruce;