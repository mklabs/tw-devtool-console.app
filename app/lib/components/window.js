
const config = require('../../config');
const Spruce = require('../store');

module.exports = function Window() {
  return {
    init() {
      this.tabSelected = config.get('tabSelected');
    },

    selectTab(tab) {
      Spruce.store('window').tabSelected = tab;
    }
  };
};
