import { app, ipcMain, Menu, dialog, Notification, shell } from "electron";
import serve from "electron-serve";
import { createWindow, markdown } from "./helpers";
import path from "path";
import open from "open";
import fs from "fs-extra";
import os from "os";
import chokidar from "chokidar";
const isProd = process.env.NODE_ENV === 'production';
const appDir = path.resolve(os.homedir(), "leaflet");
const isMac = process.platform === "darwin";
const isDev = require('electron-is-dev');
const dirTree = require('directory-tree');


if (isDev) {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
} else {
  serve({ directory: "app" });

}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 920,
    height: 800, 
    minWidth: 950, 
    minHeight: 600, 
    // resizable: false,
    // fullscreen: false,

  });

  //watchFiles(mainWindow);

  const menuBar = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: "About Leaflet",
                click: async () => {
                  const { shell } = require("electron");
                  await shell.openExternal(
                    "https://github.com/ahmedsaheed/Leaflet"
                  );
                },
              },
              { type: "separator" },
              { role: "reload" },
              { role: "forceReload" },
              isDev ? { role: "toggleDevTools" } : null,
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : [
          {
            label: "Leaflet",
            submenu: [
              {
                label: "About Leaflet",
                click: async () => {
                  const { shell } = require("electron");
                  await shell.openExternal(
                    "https://github.com/ahmedsaheed/Leaflet"
                  );
                },
              },
              { role: "reload" },
              { role: "forceReload" },
              isDev ? { role: "toggleDevTools" } : null,
              // { role: "toggleDevTools" },
              { type: "separator" },
              { role: "minimize" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]),

    {
      label: "File",
      submenu: [
        {
          label: "New",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            mainWindow.webContents.send("new");
          },
        },
        {
          label: "Open",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            mainWindow.webContents.send("open");
          },
        },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+s",
          click: () => {
            mainWindow.webContents.send("save");
          },
        },
        {
          label: "Export",
          
      
          submenu: [
            {
              label: "DOCX",
              accelerator: "CmdOrCtrl+D",
              // click: () => {
              //   mainWindow.webContents.send("docx");

              // }
            },
            {
              label: "PDF",
              accelerator: "CmdOrCtrl+E",
              // click: () => {
              //   mainWindow.webContents.send("pdf");
              // }
            }
            
          ]
        }
      ],
    },

    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },

        ...(isMac
          ? [
              { role: "pasteAndMatchStyle" },
              { role: "delete" },
              { role: "selectAll" },
              { type: "separator" },
            ]
          : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
      ],
    },
    {
      label: "Mode",
      submenu: [
        {
          label: "Insert",
          accelerator: "CmdOrCtrl+i",
          click: () => {
            mainWindow.webContents.send("insertClicked");
          },
        },
        {
          label: "Preview",
          accelerator: "CmdOrCtrl+p",
          click: () => {
            mainWindow.webContents.send("previewClicked");
          },
        },
      ],
    },
    {
      role: "help",
      submenu: [
        {
          label: "Controls",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal(
              "https://github.com/ahmedsaheed/Leaflet/blob/master/README.md#shortcuts-and-controls"
            );
          },
        },
        {
          label: "Open Issues",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal(
              "https://github.com/ahmedsaheed/Leaflet/issues/new"
            );
          },
        },
        
      ],
    },
  ];

  if (isDev) {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
   // mainWindow.webContents.openDevTools();
  } else {
    try{
      await mainWindow.loadURL('app://./home.html');
    }catch(err){
      console.log(err);
    }
    
  }

  const menu = Menu.buildFromTemplate(menuBar);
  Menu.setApplicationMenu(menu);

 

  
})();

const created = (name) => {
  const extension = name.split(".").pop();
  const realName = extension == "md" ? name : `${name}.md`;
  const notif = new Notification({
    title: "File Created",
    body: `${realName} has been successfully created.`,
  });

  notif.show();
};

const filesAdded = (size) => {
  const notif = new Notification({
    title: "Files added",
    body: `${size} ${size > 1 ? "files" : "file"} has been successfully added.`,
  });

  notif.show();
};
const checkForDir = () => {
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir);
    fs.writeFileSync(path.resolve(appDir, "onboarding.md"), markdown);
  }
};

//THIS ENABLES FILE GATHERING RECURSIVELY
var walk = function(dir) {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function(file) {
      file = dir + '/' + file;
      var stat = fs.statSync(file);
      if (stat && stat.isDirectory()) { 
          results = results.concat(walk(file));
      } else { 
          results.push(file);
      }
  });
  return results;
}

const getFiles = () => {
  checkForDir();
  const files = walk(appDir);
  const structure = dirTree(appDir, {extensions:/\.md/}); 
  return files
    .filter((file) => file.split(".").pop() === "md")
    .map((filePath) => {
      const fileStats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, "utf8");
      const extension = path.extname(filePath);
      const filename = path.basename(filePath,extension);

      return {
        name: filename.charAt(0).toUpperCase() + filename.slice(1),
        structure: structure,
        body: content,
        path: filePath,
      
      };
    });
};


const addFilesOnDragOrDialog = (files = []) => {
  fs.ensureDirSync(appDir);
  files.forEach((file) => {
    const filePath = path.resolve(appDir, file.name);
    try{
      if (!fs.existsSync(filePath)) {
      fs.copyFileSync(file.path, filePath);
    }
    }catch (e){
      console.log(e)
    }
    
  });

  filesAdded(files.length);
};

const deleteFile = (filePath) => {
  try{
    if (fs.existsSync(filePath)) {
      // move file to trash instead of fs.removeSync
      shell.trashItem(filePath);
    }
  }catch(e){
    console.log(e);
  }
  
};

const openFile = (filename) => {
  const filePath = path.resolve(appDir, filename);

  if (fs.existsSync(filePath)) {
    open(filePath);
  }
};

const watchFiles = (win) => {
  chokidar.watch(appDir).on("unlink", (filepath) => {
    win.webContents.send("app:delete-file", path.parse(filepath).base);
  });
};

const newFile = (dir,file) => {
  const today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date + " " + time;
  const extension = file.split(".").pop();
  if (fs.existsSync(dir)) {
    fs.writeFileSync(
      path.resolve(dir, `${extension == "md" ? file : file + ".md"}`),
      `File Name: **${file}** <br> Created at: ${dateTime}.`
    );
  }
};

ipcMain.handle("saveFile", (event, path, content) => {
  try {
    fs.writeFileSync(path, content);
  } catch (e) {
    console.log(e);
  }
});


ipcMain.handle("createNewFile", (event, dir,filename) => {
  newFile(dir,filename);
  created(filename);
});
ipcMain.handle("getTheFile", () => {
  return getFiles();
});
ipcMain.handle("app:on-file-add", (event, files = []) => {
  addFilesOnDragOrDialog(files);
});

ipcMain.handle("app:on-fs-dialog-open", (event) => {
  const files = dialog.showOpenDialogSync({
    properties: ["openFile", "multiSelections"],
  });

  if (!files) {
    return;
  }

  addFilesOnDragOrDialog(
    files.map((filepath) => {
      return {
        name: path.parse(filepath).base,
        path: filepath,
      };
    })
  );
});


ipcMain.on("app:on-file-open", (event, file) => {
  openFile(file.filepath);
});
ipcMain.on("app:on-file-copy", (event, file) => {
  event.sender.startDrag({
    file: file.filepath,
    icon: file.icon,
  });
});



ipcMain.handle("deleteFile", (event, name, file) => {
  const extension = name.split(".").pop();
  const options = {
    type: "question",
    buttons: ["Delete", "Cancel"],
    defaultId: 2,
    icon: "warning",
    title: "Confirm",
    message: `Are you sure you want to delete ${extension == "md" ? name : name + ".md"}?`,
    detail: "This action cannot be undone.",
  };
  dialog.showMessageBox(null, options).then((result) => {
      if (result.response === 0) {
        deleteFile(file);
      } else if (result.response === 1) {
        return
      }
    })

});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
