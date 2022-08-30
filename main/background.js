import { app, ipcMain, Menu, dialog, Notification } from "electron";
import serve from "electron-serve";
import { createWindow, markdown } from "./helpers";
import path from "path";
import open from "open";
import fs from "fs-extra";
import os from "os";
import chokidar from "chokidar";
const appDir = path.resolve(os.homedir(), "dairy");
const isProd = process.env.NODE_ENV === "production";
const isMac = process.platform === "darwin";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();
  const mainWindow = createWindow("main", {
    width: 800,
    height: 500, //462 initially
    minWidth: 800, 
    minHeight: 500, //462 initially
    // resizable: false,
    // fullscreen: false,

  });
  watchFiles(mainWindow);

  mainWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    setTimeout(() => {
      require("electron").shell.openExternal(url);
    }, 500);
  });

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
              { role: "toggleDevTools" },
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
              { role: "toggleDevTools" },
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
          label: "Open Issues",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal(
              "https://github.com/ahmedsaheed/Leaflet/issues/new"
            );
          },
        },
        {
          label: "Controls",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal(
              "https://github.com/ahmedsaheed/Leaflet/blob/master/README.md"
            );
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuBar);
  Menu.setApplicationMenu(menu);

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
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
  let place = 0;
  return files
    .filter((file) => file.endsWith(".md"))
    .map((filePath) => {
      const fileStats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, "utf8");
      const extension = path.extname(filePath);
      const filename = path.basename(filePath,extension);
      place++;

      return {
        index: place,
        name: filename,
        body: content,
        path: filePath,
        size: Number(fileStats.size / 1000).toFixed(1), // kb
      };
    });
};

const addFiles = (files = []) => {
  fs.ensureDirSync(appDir);
  files.forEach((file) => {
    const filePath = path.resolve(appDir, file.name);

    if (!fs.existsSync(filePath)) {
      fs.copyFileSync(file.path, filePath);
    }
  });

  filesAdded(files.length);
};

const deleteFile = (filename) => {
  const filePath = path.resolve(appDir, filename);

  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
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

const newFile = (file) => {
  const today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date + " " + time;
  const extension = file.split(".").pop();
  if (fs.existsSync(appDir)) {
    fs.writeFileSync(
      path.resolve(appDir, `${extension == "md" ? file : file + ".md"}`),
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

ipcMain.handle("createNewFile", async (event, filename) => {
  newFile(filename);
  created(filename);
});
ipcMain.handle("getTheFile", () => {
  return getFiles();
});
ipcMain.handle("app:on-file-add", (event, files = []) => {
  addFiles(files);
});

ipcMain.handle("app:on-fs-dialog-open", (event) => {
  const files = dialog.showOpenDialogSync({
    properties: ["openFile", "multiSelections"],
  });

  if (!files) {
    return;
  }

  addFiles(
    files.map((filepath) => {
      return {
        name: path.parse(filepath).base,
        path: filepath,
      };
    })
  );
});

ipcMain.on("app:on-file-delete", (event, file) => {
  deleteFile(file.filepath);
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

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
