'use strict';

var _electron = require("electron");

var _lib = require("vue-cli-plugin-electron-builder/lib");

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
_electron.protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    secure: true,
    standard: true
  }
}]);

function createWindow() {
  var win, login;
  return regeneratorRuntime.async(function createWindow$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // Create the browser window.
          win = new _electron.BrowserWindow({
            width: 400,
            height: 280,
            maxWidth: 1000,
            maxHeight: 800,
            minWidth: 400,
            minHeight: 280,
            frame: false,
            transparent: true,
            resizable: true,
            shadow: true,
            webPreferences: {
              // Use pluginOptions.nodeIntegration, leave this alone
              // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
              nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
              contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
              webSecurity: false,
              // 允许跨域
              preload: _path["default"].join(__dirname, "preload.js")
            }
          }); // 关闭窗口

          _electron.ipcMain.once('shutDown', function () {
            _electron.app.exit();
          }); // 关闭窗口


          _electron.ipcMain.on('minimize', function () {
            console.log(win.maxWidth);
            win.minimize();
          }); // 未登录不允许调整窗口


          login = false;
          win.on('will-resize', function (e) {
            if (!login) {
              e.preventDefault();
            }
          }); // 窗口重置

          _electron.ipcMain.on('resize', function (e, arg) {
            console.log(arg);
            login = arg;

            if (arg) {
              win.setSize(1000, 800);
            } else {
              win.setSize(400, 280);
            }

            win.center();
          });

          if (!process.env.WEBPACK_DEV_SERVER_URL) {
            _context.next = 12;
            break;
          }

          _context.next = 9;
          return regeneratorRuntime.awrap(win.loadURL(process.env.WEBPACK_DEV_SERVER_URL));

        case 9:
          if (!process.env.IS_TEST) win.webContents.openDevTools();
          _context.next = 14;
          break;

        case 12:
          (0, _lib.createProtocol)('app'); // Load the index.html when not in development

          win.loadURL('app://./index.html'); // win.loadURL('https://chat.asea.fun')
          // win.webContents.openDevTools()

        case 14:
        case "end":
          return _context.stop();
      }
    }
  });
} // Quit when all windows are closed.


_electron.app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    _electron.app.quit();
  }
});

_electron.app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (_electron.BrowserWindow.getAllWindows().length === 0) createWindow();
}); // This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.


_electron.app.on('ready', function _callee() {
  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // if (isDevelopment && !process.env.IS_TEST) {
          //   // Install Vue Devtools
          //   try {
          //     await installExtension(VUEJS3_DEVTOOLS)
          //   } catch (e) {
          //     console.error('Vue Devtools failed to install:', e.toString())
          //   }
          // }
          createWindow();

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // Exit cleanly on request from parent process in development mode.


if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', function (data) {
      if (data === 'graceful-exit') {
        _electron.app.quit();
      }
    });
  } else {
    process.on('SIGTERM', function () {
      _electron.app.quit();
    });
  }
}