const { BrowserWindow, ipcMain, app } = require("electron");

let mainWindow;

const turnRight = () => {
  port.write("1");
};

const turnLeft = () => {
  port.write("0");
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("src/views/index.html");

  app.whenReady().then(() => {
    mainWindow.webContents.on("did-finish-load", () => {
      console.log("did-finish-load");
      mainWindow.webContents.send("data-from-server", { func: "turnLeft" });
    });
  });
}

module.exports = {
  createWindow,
  turnLeft,
  turnRight,
};
