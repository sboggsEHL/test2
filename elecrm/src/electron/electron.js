const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require("path");
const url = require("url");
const ToastWindowManager = require("./toast-manager");
require("dotenv").config();

app.name = "CRM Main";

let mainWindow;
let softphoneWindow;
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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    },
  });

  // Initialize toast manager with main window
  toastManager = new ToastWindowManager(mainWindow);

  const startUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5173"
      : url.format({
          pathname: path.join(__dirname, "..", "..", "dist", "index.html"),
          protocol: "file:",
          slashes: true,
        });

  mainWindow.loadURL(startUrl);

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.origin === new URL(startUrl).origin) {
      return;
    }
    event.preventDefault();
  });

  mainWindow.webContents.on('did-navigate-in-page', (event, url) => {
    console.log('Internal navigation:', url);
  });

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("shared-state", sharedState);
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(startUrl)) {
      event.preventDefault();
    }
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.on('closed', () => {
    toastManager.cleanup();
  });
}

ipcMain.on("call-accepted", (event, { callSid, fromNumber }) => {
  console.log("Electron main: call accepted:", callSid);
  mainWindow.webContents.send("stop-ringtone");
  if (softphoneWindow) {
    softphoneWindow.webContents.send("call-accepted", { callSid, fromNumber });
  }
});

ipcMain.on("call-declined", (event, { callSid, fromNumber }) => {
  console.log("Electron main: call declined:", callSid);
  mainWindow.webContents.send("stop-ringtone");
  if (softphoneWindow) {
    softphoneWindow.webContents.send("call-declined", { callSid, fromNumber });
  }
});

app.on("ready", async () => {
  createWindow();

  if (process.env.NODE_ENV === "development") {
    try {
      const {
        default: installExtension,
        REACT_DEVELOPER_TOOLS,
      } = require("electron-devtools-installer");
      await installExtension(REACT_DEVELOPER_TOOLS);
      console.log("React Developer Tools installed");
    } catch (err) {
      console.log("Error installing React Developer Tools:", err);
    }
  }
});

ipcMain.on("open-softphone-window", () => {
  if (!softphoneWindow || softphoneWindow.isDestroyed()) {
    softphoneWindow = new BrowserWindow({
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

    const softphoneUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173/#/softphone"
        : url.format({
            pathname: path.join(__dirname, "..", "..", "dist", "index.html"),
            protocol: "file:",
            hash: "/softphone",
            slashes: true,
          });

    softphoneWindow.loadURL(softphoneUrl);

    softphoneWindow.webContents.on("did-finish-load", () => {
      console.log("[main] Softphone window loaded, sending initial state");
      softphoneWindow.webContents.send("shared-state", sharedState);
    });

    softphoneWindow.on("closed", () => {
      softphoneWindow = null;
    });
  }
});

ipcMain.handle("get-env", (event, key) => {
  return process.env[key];
});

ipcMain.handle("get-shared-state", () => {
  try {
    if (!sharedState || !sharedState.initialized) {
      return {
        success: false,
        error: "Shared state not yet initialized",
      };
    }
    console.log("Getting shared state:", sharedState);
    return {
      success: true,
      data: sharedState,
    };
  } catch (error) {
    console.error("Error getting shared state:", error);
    return {
      success: false,
      error: error.message || "Unknown error getting shared state",
    };
  }
});

ipcMain.on(
  "show-notification",
  (event, { title, description, leadId, primaryActionLabel }) => {
    const notification = new Notification({
      title,
      body: description,
      actions: [
        {
          type: "button",
          text: primaryActionLabel || "Assign",
        },
      ],
    });

    notification.show();

    notification.on("action", () => {
      event.sender.send("assign-lead", leadId);
    });

    notification.on("click", () => {
      event.sender.send("assign-lead", leadId);
    });
  }
);

const notifySoftphone = () => {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach(win => {
    if (win !== mainWindow) {
      win.webContents.send('shared-state', sharedState);
    }
  });
};

ipcMain.on("request-shared-state", (event) => {
  console.log("[main] Received state request");
  const requester = BrowserWindow.fromWebContents(event.sender);
  if (requester) {
    console.log("[main] Sending state to requester");
    requester.webContents.send("shared-state", sharedState);
  }
});

let softphoneWindows = new Set();

ipcMain.on("update-shared-state", (event, newState) => {
  console.log("[main] State update received:", newState);
  sharedState = { ...sharedState, ...newState, initialized: true };
  
  softphoneWindows.forEach(windowId => {
    const win = BrowserWindow.fromId(windowId);
    if (win) {
      console.log("[main] Broadcasting to softphone:", windowId);
      win.webContents.send("softphone-state-update", sharedState);
    }
  });
});

ipcMain.on("register-softphone", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    console.log("[main] Registering softphone window:", win.id);
    softphoneWindows.add(win.id);
    win.webContents.send("softphone-state-update", sharedState);
  }
});

app.on("browser-window-closed", (_, window) => {
  if (softphoneWindows.has(window.id)) {
    console.log("[main] Removing softphone window:", window.id);
    softphoneWindows.delete(window.id);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
