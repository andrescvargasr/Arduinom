const {app, BrowserWindow} = require('electron');

const express = require('./express');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


app.on('ready', function() {
  express(); // we start our internal we bserver
  mainWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      autoHideMenuBar: true,
      useContentSize: true,
      resizable: false,
  });

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
      mainWindow = null
  });

  mainWindow.loadURL('http://localhost:8080/');
  mainWindow.focus();
});


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
