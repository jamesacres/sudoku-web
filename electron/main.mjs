import { app, BrowserWindow, dialog, ipcMain, screen, shell } from 'electron';
import serve from 'electron-serve';
import path from 'path';
const __dirname = import.meta.dirname;

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('sudoku', process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient('sudoku');
}

const appServe = serve({
  directory: path.join(__dirname, 'out'),
});

let win;
const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    show: false,
    width: width - 100,
    height: height - 100,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  appServe(win).then(() => {
    win.loadURL('app://-');
  });

  win.once('ready-to-show', () => {
    win.show();
  });
};

const handleDeepLink = (url) => {
  if (win) {
    if (win.isMinimized()) {
      win.restore();
    }
    win.focus();
  }
  dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`);
};

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine, _workingDirectory) => {
    const url = commandLine.pop();
    handleDeepLink(url);
  });
  app.on('open-url', (_event, url) => {
    handleDeepLink(url);
  });

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    createWindow();
  });
}

app.on('window-all-closed', () => {
  //if (process.platform !== 'darwin') {
  app.quit();
  //}
});

ipcMain.handle('openBrowser', (_event, url) => {
  shell.openExternal(url);
});
