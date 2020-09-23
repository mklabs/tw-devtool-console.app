const log = debug("watch:console");
const fs = require("fs");
const path = require("path");
const chokidar = require('chokidar');
const Spruce = require("@ryangjchandler/spruce");

const cm = require('../static/vendors/codemirror/lib/codemirror');
require('../static/vendors/codemirror/mode/javascript/javascript');
require('../static/vendors/codemirror/mode/lua/lua');
require('../static/vendors/codemirror/addon/runmode/runmode');

let watcherIsReady = false;

function getHTMLHighlighted(html) {
    const div = document.createElement('div');
    cm.runMode(html, 'lua', div);
    return div.innerHTML;
}

function onReady() {
    log('Initial scan complete for console. Ready for changes');
    watcherIsReady = true;
}

function onChange(filepath) {
    if (!watcherIsReady) {
        return;
    }

    const basename = path.basename(filepath);
    log(`Console: File ${filepath} has been changed. basename: ${basename}`);

    if (basename === 'output.txt') {
        const content = fs.readFileSync(filepath, 'utf8');
        const html = getHTMLHighlighted(content);
        Spruce.store('console').messages.push({ type: 'user-command-result', content, html });
        Spruce.store('console').changeTimestamp = Date.now();
    } else if (basename === 'error.txt') {
        const content = fs.readFileSync(filepath, 'utf8');
        Spruce.store('console').messages.push({ type: 'user-command-result-error', content });
        Spruce.store('console').changeTimestamp = Date.now();
    }
}

let watcher;
function initWatcher(paths) {
    log("Initialize watcher with", paths);

    // Initialize watcher.
    watcher = chokidar.watch(paths, {
        persistent: true
    });

    // Add event listeners.
    watcher
        .on('change', onChange)
        .on('error', error => log(`Watcher error: ${error}`))
        .on('ready', onReady);

    return watcher;
}

async function closeWatcher() {
    if (!watcher) {
        return;
    }

    log("closeWatcher");
    await watcher.close();
}

module.exports = {
    initWatcher,
    closeWatcher
};
