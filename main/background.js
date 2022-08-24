import { app, ipcMain, shell , dialog } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import path from 'path';
import open from 'open';
const fs = require( 'fs-extra' );
const os = require( 'os' );
const { Notification } = require( 'electron' );
const chokidar = require( 'chokidar' );


const appDir = path.resolve( os.homedir(), 'dairy' );

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

const filesAdded = ( size ) => {
  const notif = new Notification( {
      title: 'Files added',
      body: `${ size } file(s) has been successfully added.`
  } );

  notif.show();
};

const getFiles = () => {
  console.log("here too");
  const files = fs.readdirSync( appDir );
  console.log( files );

  //return only files that end with .md
  return files.filter( file => file.endsWith( '.md' ) ).map( filename => {
      const filePath = path.resolve( appDir, filename );
      const fileStats = fs.statSync( filePath );

      return {
          name: filename,
          path: filePath,
          size: Number( fileStats.size / 1000 ).toFixed( 1 ), // kb
      };
  } );
};

const addFiles = ( files = [] ) => {
    
  // ensure `appDir` exists
  fs.ensureDirSync( appDir );
  
  // copy `files` recursively (ignore duplicate file names)
  files.forEach( file => {
      const filePath = path.resolve( appDir, file.name );

      if( ! fs.existsSync( filePath ) ) {
          fs.copyFileSync( file.path, filePath );
      }
  } );

  // display notification
  filesAdded( files.length );
};

const deleteFile = ( filename ) => {
  const filePath = path.resolve( appDir, filename );

  // remove file from the file system
  if( fs.existsSync( filePath ) ) {
      fs.removeSync( filePath );
  }
};

const openFile = ( filename ) => {
  const filePath = path.resolve( appDir, filename );

  // open a file using default application
  if( fs.existsSync( filePath ) ) {
      open( filePath );
  }
};
const watchFiles = ( win ) => {
  chokidar.watch( appDir ).on( 'unlink', ( filepath ) => {
      win.webContents.send( 'app:delete-file', path.parse( filepath ).base );
  } );
}


// return list of files
ipcMain.handle( 'getTheFile', () => {
  console.log("got here")
    return getFiles();
} );

// listen to file(s) add event
ipcMain.handle( 'app:on-file-add', ( event, files = [] ) => {
    addFiles( files );
} );

ipcMain.handle( 'app:on-fs-dialog-open', ( event ) => {
  const files = dialog.showOpenDialogSync( {
      properties: [ 'openFile', 'multiSelections' ],
  } );

  addFiles( files.map( filepath => {
      return {
          name: path.parse( filepath ).base,
          path: filepath,
      };
  } ) );
} );

// listen to file delete event
ipcMain.on( 'app:on-file-delete', ( event, file ) => {
  deleteFile( file.filepath );
} );

// listen to file open event
ipcMain.on( 'app:on-file-open', ( event, file ) => {
  openFile( file.filepath );
} );

// listen to file copy event
ipcMain.on( 'app:on-file-copy', ( event, file ) => {
  event.sender.startDrag( {
      file: file.filepath,
      icon: file.icon,
  } );
} );

app.on('window-all-closed', () => {
  app.quit();
});


