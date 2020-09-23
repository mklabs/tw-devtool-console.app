const remote = require("electron").remote;
const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");
const { format, formatDistance, formatRelative, subDays } = require("date-fns");
const { fr } = require("date-fns/locale");

const Spruce = require("./lib/store");

const TABS_CONSOLE = "Console";
const TABS_LOGS = "Logs";
const TABS_SETTINGS = "Settings";

const date = {
    format(date, pattern = "Ppp") {
        return format(date, pattern, { locale: fr })
    }
};

localStorage.debug = "*";

const { Console, Window, Settings} = require("./lib/components");
const Alpine = require("alpinejs");