# TW Modding Devtool Console

> An electron application for Total War games that lets you execute LUA code while the game is running.
>
> It aims to provide a basic REPL (read eval print loop) to assist in mod scripting.
>
> Supports Troy and Warhammer 2.

![Modding Console App](https://cdn.discordapp.com/attachments/508743011899801601/758508947438305322/unknown.png)


## Install

*Windows 7+ platforms are supported (64-bit only).*

**Windows**

[**Download**](https://github.com/mklabs/tw-devtool-console.app/releases/latest) the `.exe` file.

## Features

This application is basically an enhanced version of the [Modding DevTool Console mod for Warhammer 2](https://steamcommunity.com/workshop/filedetails/?id=1574469690)

- Better editing with syntax highligting and proper multiline support (Press Enter to execute, Shift+Enter to insert a new line)
- History of commands (navigate through them with Up / Down arrow while on the command prompt)
- `_0` special variable is a reference to the last UIComponent clicked within the game
- Use `print()` to debug variables
- Implicit return on the last statement
- Inspect variables and tables like `cm` or `core`

Possible improvements: auto-completion, log files panel, support for more games (Three Kingdoms, Thrones of Britannia, ...)

---


## Dev

Built with [Electron](https://electronjs.org).

### Run

```
$ npm install
$ npm start
```
