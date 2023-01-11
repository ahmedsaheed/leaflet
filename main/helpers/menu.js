import { app, Menu } from "electron";

export default function mainMenu(mainWindow) {
  const isMac = process.platform === "darwin";
  const sendToMainWindow = (action) => {
    if (!mainWindow) {
      return;
    }
    mainWindow.webContents.send(action);
  };

  const menuBar = [
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
            sendToMainWindow("new");
          },
        },
        {
          label: "Open",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            sendToMainWindow("open");
          },
        },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+s",
          click: () => {
            sendToMainWindow("save");
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
            },
          ],
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
            sendToMainWindow("insertClicked");
          },
        },
        {
          label: "Preview",
          accelerator: "CmdOrCtrl+p",
          click: () => {
            sendToMainWindow("previewClicked");
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
  // const menu = Menu.buildFromTemplate(menuBar);
  // return menu;
 return menuBar;
}
