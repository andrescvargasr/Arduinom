'use strict';

const {app, BrowserWindow} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


app.on('ready', function () {
    require('../server/server');
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 1000,
        autoHideMenuBar: false,
        useContentSize: true,
        resizable: true,
        webPreferences: {
            zoomFactor: 1.5,
            nodeIntegration: false
        }
    });

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.loadURL('http://localhost:8080/');
    mainWindow.focus();
});


// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) { // eslint-disable-line no-undef
        createWindow(); // eslint-disable-line no-undef
    }
});
