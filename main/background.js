import { app, ipcMain, Menu, dialog } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import path from "path";
import open from "open";
const fs = require("fs-extra");
const os = require("os");
const { Notification } = require("electron");
const chokidar = require("chokidar");




const markdown = `
# Leaflet

[[toc]]

<a href="http://wiki.xxiivv.com/Left" target="_blank"></a>Left is <b>distractionless plaintext editor</b> designed to quickly navigate between segments of an essay, or multiple documents. It features an auto-complete, synonyms suggestions, writing statistics, markup-based navigation and a speed-reader.
 $(ax^2 + bx + c = 0)$  

$$\\sqrt{3x-1}+(1+x)^2$$

The <a href="http://github.com/hundredrabbits/Left" target="_blank" rel="noreferrer" class="external ">application</a> was initially created to help Rek with the writing of the upcoming novel Wiktopher, and later made available as a free and <a href="https://github.com/hundredrabbits/Left" target="_blank" rel="noreferrer" class="external ">open source</a> software.

$$\\sqrt{3x-1}+(1+x)^2$$

Learn more by reading the <a href="https://100r.co/site/left.html" target="_blank" rel="noreferrer" class="external ">manual</a>, or have a look at a <a href="https://www.youtube.com/watch?v=QloUoqqhXGE" target="_blank" rel="noreferrer" class="external ">tutorial video</a>. If you need <b>help</b>, visit the <a href="https://hundredrabbits.itch.io/left/community" target="_blank" rel="noreferrer" class="external ">Community</a>.

- [ ] Mercury
- [x] Venus
- [x] Earth (Orbit/Moon)
- [x] Mars


$$\\left( \\sum_{k=1}^n a_k b_k \\right)^2 \\leq \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)$$

## Install & Run

You can download [builds](https://hundredrabbits.itch.io/left) for **OSX, Windows and Linux**, or if you wish to build it yourself, follow these steps:

$$\\sqrt{3x-1}+(1+x)^2$$

Here's a simple footnote,[^1] and here's a longer one.[^bignote]

[^1]: This is the first footnote.

[^bignote]: Here's one with multiple paragraphs and code.

    Indent paragraphs to include them in the footnote.
    Add as many paragraphs as you like.

<img src='https://raw.githubusercontent.com/hundredrabbits/Left/master/PREVIEW.jpg' width="600"/>

\`\`\`go\n
func threeSum(nums []int) [][]int {
  res := [][]int{}
  sort.Ints(nums)
  for i := range nums {
      if i > 0 && nums[i] == nums[i-1] {
          continue
      }
      j, k := i+1, len(nums)-1
      for j < k {
          sum := nums[i] + nums[j] + nums[k]
          switch {
          case sum < 0:
              j++
          case sum > 0:
              k--
          default:
              res = append(res, []int{nums[i], nums[j], nums[k]})
              j, k = next(nums, j, k)
          }
      }
  }
  return res
}

func next(nums []int, i, j int) (int, int) {
  for i < j {
      switch {
      case nums[i] == nums[i+1]:
          i++
      case nums[j] == nums[j-1]:
          j--
      default:
          i++
          j--
      }
  }
  
\n\`\`\`


---
## Media Support

<audio controls>
  <source src="https://olagist.net/wp-content/uploads/2020/09/J_Cole_-_Want_You_To_Fly_Javari_.mp3" 
   type="audio/mpeg">
Your browser does not support the audio element.
</audio>


## Extras

- This application supports the [Ecosystem Theme](https://github.com/hundredrabbits/Themes).
- Support this project through [Patreon](https://patreon.com/100).
- Left's source code is licensed under [MIT](https://github.com/hundredrabbits/Left/blob/master/LICENSE) and the **images, text and assets** are licensed under [BY-NC-SA 4.0](https://github.com/hundredrabbits/Left/blob/master/LICENSE.by-nc-sa-4.0.md). View individual licenses for details.
- Pull Requests are welcome!




`;

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
    height: 462,
    minWidth: 800,
    minHeight: 462,
    // resizable: false,
    fullscreen: false,
  });
  watchFiles(mainWindow);
  mainWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    setTimeout(() => {
      require("electron").shell.openExternal(url);
    }, 500);
  });

  const template = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: "About",
                click: async () => {
                  const { shell } = require("electron");
                  await shell.openExternal(
                    "https://github.com/ahmedsaheed/Leaflet"
                  );
                },
              },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),

      {
        label: "File",
        submenu: [
          {
            label: "New",
            accelerator: "CmdOrCtrl+N",
            click: () => {
              mainWindow.webContents.send("new");
            }
          },
          {
            label: "Open",
            accelerator: "CmdOrCtrl+O",
            click: () => {
              mainWindow.webContents.send("open");
            }
          },
          {
            label: "Save",
            accelerator: "CmdOrCtrl+s",
            click: () => {
              mainWindow.webContents.send("save");
            }
          }
        ]


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
    // { role: 'viewMenu' }
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "minimize" },
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
          }
        },
        {
          label: "Preview",
          accelerator: "CmdOrCtrl+p",
          click: () => {
            mainWindow.webContents.send("previewClicked");
          }
          
        },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Open Issues',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/ahmedsaheed/Leaflet/issues/new')
          }
        },
        {
          label: 'Controls',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/ahmedsaheed/Leaflet/blob/master/README.md')
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
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

const getFiles = () => {
  checkForDir();
  const files = fs.readdirSync(appDir);
  let place = 0;
  return files
    .filter((file) => file.endsWith(".md"))
    .map((filename) => {
      const filePath = path.resolve(appDir, filename);
      const fileStats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, "utf8");
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
  try{
    fs.writeFileSync(path, content);
  }catch(e){
    console.log(e);
  }
} );

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
  app.quit();
});
