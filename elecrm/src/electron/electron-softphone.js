const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const ToastWindowManager = require("./toast-manager");

let win;
let toastManager;

let sharedState = {
  isAuthenticated: false,
  username: null,
  initialized: false,
  theme: "dark",
  signalWire: {
    callState: null,
    currentMicrophone: null,
    currentOutputDevice: null,
    token: null,
  },
};

ipcMain.handle("get-shared-state", () => {
  console.log("[softphone] Handling get-shared-state request");
  try {
    return {
      success: true,
      data: sharedState
    };
  } catch (error) {
    console.error("[softphone] Error in get-shared-state:", error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.on("shared-state", (event, newState) => {
  console.log("[softphone] Received shared-state from main:", newState);
  sharedState = newState;
  if (win && !win.isDestroyed()) {
    console.log("[softphone] Forwarding state to renderer");
    win.webContents.send("shared-state", sharedState);
  }
});

app.name = "Softphone";

function createSoftphoneWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 928,
    resizable: true,
    minWidth: 350,
    maxWidth: 450,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  // Initialize toast manager with softphone window
  toastManager = new ToastWindowManager(win);

  const softphoneUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5173/#/softphone"
      : url.format({
          pathname: path.join(__dirname, "..", "..", "dist", "index.html"),
          protocol: "file:",
          hash: "/softphone",
          slashes: true,
        });

  win.loadURL(softphoneUrl);

  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools({ mode: "detach" });
  }
  
  const mainWindow = BrowserWindow.getAllWindows().find(w => w.title.includes("CRM Main"));
  if (mainWindow) {
    console.log("[softphone] Found main window, requesting state");
    mainWindow.webContents.send("request-shared-state");
  }

  win.webContents.on("did-finish-load", async () => {
    console.log("[softphone] Window loaded, registering with main process");
    ipcMain.emit("register-softphone", { sender: win.webContents });
    win.webContents.send("shared-state", sharedState);
    console.log("[softphone] Initial state sent:", sharedState);
  });

  win.on("closed", () => {
    if (toastManager) {
      toastManager.cleanup();
    }
    win = null;
  });
}

app.whenReady().then(() => {
  createSoftphoneWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createSoftphoneWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
