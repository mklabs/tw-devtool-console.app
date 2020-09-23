const { remote } = require('electron');
const Spruce = require('../store');
const { dialog } = remote;

module.exports = function Settings() {
  return {
    async showOpenDialog(folderType) {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Select folder',
        properties: ['openDirectory']
      });

      if (canceled) {
        return;
      }

      const directory = filePaths[0];
      if (!directory) {
        return;
      }

      Spruce.store('settings').folders[folderType] = directory;
    }
  };
};
