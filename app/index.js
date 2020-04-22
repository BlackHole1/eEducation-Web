const electron = require('electron');

const ipcMain = electron.ipcMain;

// workaround for resizable issue in mac os
const platform = require('os').platform();

const process = require('process');
// Module to control application life.
const {app, Menu, netLog} = electron;
// Menu template
const isMac = platform === 'darwin'

// TODO: electron menu template
// More details please see: https://www.electronjs.org/docs/api/menu#menubuildfromtemplatetemplate
const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'Log',
    submenu: [
      {
        label: 'export log'
      }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
    ]
  },
  {
    role: 'about',
    label: 'About Agora',
    click: async () => {
      const { shell } = require('electron')
      await shell.openExternal('https://www.agora.io')
    }
  }
]

const globalShortcut = electron.globalShortcut;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

async function createWindow() {

    mainWindow = new BrowserWindow({
      frame: false,
      width: 700,
      height: 500,
      center: true,
      resizable: false,
      webPreferences: {
        autoplayPolicy: 'no-user-gesture-required',
        nodeIntegration: true,
        preload: path.join(__dirname, './preload')
      }
    });

    const startUrl = process.env.ELECTRON_START_URL || 
    `file://${path.resolve(
      __dirname,
      '../../app.asar/build'
    )}/index.html`;

    mainWindow.center();

    // and load the index.html of the app.
    mainWindow.loadURL(startUrl);

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })


    const menu = Menu.buildFromTemplate(template)

    if (platform === 'darwin') {
      mainWindow.excludedFromShownWindowsMenu = true
      Menu.setApplicationMenu(menu)
    }

    if (platform === 'win32') {
      // const menu = Menu.buildFromTemplate(template)
      // Menu.setApplicationMenu(menu)
      mainWindow.setMenu(menu);
    }

    ipcMain.on('resize-window', (event, reply) => {
      
      if (platform === 'darwin') {

      }

      if (platform === 'win32') {
        if (reply.width === 700) {
          if (mainWindow.isFullScreen()) {
            mainWindow.setResizable(true);
            mainWindow.setFullScreen(false);
            mainWindow.setResizable(false);
          }
        }
      }

      mainWindow.setContentSize(reply.width, reply.height, false);
      mainWindow.center();
    });

    ipcMain.on('minimum', () => {
      mainWindow.minimize();
    });

    ipcMain.on('maximum', () => {

      if (platform === 'win32') {
        const fullscreen = mainWindow.isFullScreen();
        if (fullscreen) {
          mainWindow.setResizable(true);
          mainWindow.setFullScreen(false);
          mainWindow.setResizable(false);
        } else {
          mainWindow.setResizable(true);
          mainWindow.setFullScreen(true);
          mainWindow.setResizable(false);
        }
      }

      if (platform === 'darwin') {
        const fullscreen = mainWindow.isFullScreen();
        mainWindow.setFullScreen(!fullscreen);
      }

    });

    ipcMain.on('close', () => {
      app.quit();
    });

    let res = app.setAppLogsPath();

    console.log("Your electron log path", app.getPath('logs'), " res ", res)

    await netLog.startLogging(`${app.getAppPath()}/netLog.log`);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);


app.whenReady().then(() => {
  // more details: https://www.electronjs.org/docs/tutorial/keyboard-shortcuts
  globalShortcut.register('Control+Shift+X', () => {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  })
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    console.log("main process activate");
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }

    if (mainWindow) {
      mainWindow.show();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.