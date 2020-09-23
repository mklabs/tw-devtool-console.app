const Store = require('electron-store');

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
