import { app, ipcMain, shell } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import io from './helpers'
import path from 'path';
import open from 'open';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
     width: 800,
     height: 462,
     minWidth: 400,
     minHeight: 360,
      resizable: false
  });

    mainWindow.webContents.on('new-window', function(e, url) {
  e.preventDefault();
  setTimeout(() => { require('electron').shell.openExternal(url) }, 500)
 });


  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});
// return list of files
ipcMain.handle( 'app:get-files', () => {
    return io.getFiles();
} );

// listen to file(s) add event
ipcMain.handle( 'app:on-file-add', ( event, files = [] ) => {
    io.addFiles( files );
} );


