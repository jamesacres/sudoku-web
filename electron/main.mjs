import { app, BrowserWindow, screen } from 'electron';
import serve from 'electron-serve';
import path from 'path';
const __dirname = import.meta.dirname;

app.setAsDefaultProtocolClient('sudoku');

const appServe = serve({
  directory: path.join(__dirname, 'out'),
});

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
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

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  //if (process.platform !== 'darwin') {
  app.quit();
  //}
});
