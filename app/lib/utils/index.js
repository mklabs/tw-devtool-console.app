/* eslint no-await-in-loop: 0 */

const log = debug('utils');
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const glob = require('glob');
const copyFile = promisify(fs.copyFile);
const mkdirp = require('mkdirp');

async function copyModFolder(destination) {
  log('Copy mod folder into %s', destination);

  const cwd = path.join(__dirname, '../../mod');
  const files = glob.sync('**/*', { cwd, nodir: true });

  for (const file of files) {
    const src = path.join(cwd, file);
    const dest = path.join(destination, 'data', file);
    log('Copy %s into %s', file, destination);
    await mkdirp(path.dirname(dest));
    await copyFile(src, dest);
    log('Copied %s sucesfully', dest);
  }
}

module.exports = {
  copyModFolder
};
