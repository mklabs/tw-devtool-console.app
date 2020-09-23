const log = debug('components:console');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const config = require('../../config');

const cm = require('../../static/vendors/codemirror/lib/codemirror');
const Spruce = require('../store');
require('../../static/vendors/codemirror/mode/javascript/javascript');
require('../../static/vendors/codemirror/mode/lua/lua');
require('../../static/vendors/codemirror/addon/runmode/runmode');

function getHTMLHighlighted(html) {
  const div = document.createElement('div');
  cm.runMode(html, 'lua', div);
  return div.innerHTML;
}

module.exports = function Console() {
  return {
    lua: '',
    filterValue: '',
    textPromptFocused: false,
    textPromptEmpty: false,

    historyIndex: 0,
    history: [],

    init() {
      this.history = config.get('console.history');
      this.historyIndex = this.history.length - 1;
      this.createEditor();

      Spruce.watch('console.changeTimestamp', () => {
        this.$nextTick(() => {
          this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight - this.$refs.messages.clientHeight;
        });
      });
    },

    createEditor() {
      const editor = cm.fromTextArea(this.$refs.prompt, {
        mode: 'lua',
        lineNumbers: false,
        matchBrackets: true,
        smartIndent: true,
        styleSelectedText: true,
        electricChars: true,
        styleActiveLine: true,
        indentUnit: 4,
        indentWithTabs: false,
        lineWrapping: true,
        lineWiseCopyCut: false,
        tabIndex: 0
      });

      editor.setOption('extraKeys', {
        Up: cm => {
          const { line } = cm.getCursor();

          if (line) {
            return cm.execCommand('goLineUp');
          }

          const historyCommand = this.history[this.historyIndex];

          if (historyCommand) {
            cm.setValue(historyCommand);
            cm.execCommand('goDocStart');
            cm.execCommand('goLineEnd');

            this.historyIndex--;
            if (this.historyIndex < 0) {
              this.historyIndex = 0;
            }
          }
        },

        Down: cm => {
          const { line } = cm.getCursor();
          const lineCount = cm.lineCount();

          if (line !== lineCount - 1) {
            return cm.execCommand('goLineDown');
          }

          const historyCommand = this.history[this.historyIndex];

          if (historyCommand) {
            cm.setValue(historyCommand);
            cm.execCommand('goDocEnd');

            this.historyIndex++;
            if (this.historyIndex > this.history.length - 1) {
              this.historyIndex = this.history.length - 1;
            }
          }
        },

        Enter: cm => {
          const value = cm.getValue();
          this.lua = value;

          this.pushToHistory(value);
          this.submitForm(value);

          cm.setValue('');
        },

        'Ctrl-L': () => {
          this.clear();
        },

        'Ctrl-U': cm => {
          cm.setValue('');
        }
      });
    },

    submitForm() {
      if (!this.lua) {
        return;
      }

      this.writeInputScript(this.lua);
      const timestamp = Date.now();
      Spruce.store('console').messages.push({ type: 'user-command', content: this.lua, html: getHTMLHighlighted(this.lua), timestamp });
      Spruce.store('console').changeTimestamp = Date.now();
    },

    clear() {
      Spruce.store('console').messages = [];
    },

    filter() {
      const value = this.$refs.filter.textContent;
      this.filterValue = value;
    },

    clearFilter() {
      this.$refs.filter.textContent = '';
      this.filterValue = '';
    },

    pushToHistory(value) {
      if (!value.trim()) {
        return;
      }

      this.history.push(value);
      this.historyIndex = this.history.length - 1;
      config.set('console.history', this.history);
    },

    async writeInputScript(content) {
      content = `-- ${Date.now()}\n\n${content.trim()}`;
      const dest = path.join(Spruce.store('console').scriptFolder, 'console');

      log('writeInputScript to %s', dest, `\n${content}`);

      await mkdirp(dest);
      await writeFile(path.join(dest, 'input.lua'), content);
    }
  };
};
