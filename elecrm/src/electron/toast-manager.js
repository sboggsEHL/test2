const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");

class ToastWindowManager {
  constructor(parentWindow) {
    this.toastWindows = new Set();
    this.parentWindow = parentWindow;
    this.setupIpcHandlers();
  }

  setupIpcHandlers() {
    ipcMain.on("show-toast", (event, message) => {
      console.log("[ToastManager] Received show-toast event:", message);
      this.createToastWindow(
        message,
        BrowserWindow.fromWebContents(event.sender)
      );
    });

    ipcMain.on(
      "toast-action-clicked",
      (event, { action, message: toastMessage }) => {
        const sourceWindow = BrowserWindow.fromWebContents(event.sender);
        const targetWindow = this.findTargetWindow(sourceWindow);

        if (action === "primary") {
          if (toastMessage.toastType === "call") {
            targetWindow?.webContents.send("accept-incoming-call", {
              callSid: toastMessage.callSid,
              fromNumber: toastMessage.fromNumber,
            });
          } else if (toastMessage.toastType === "warm-transfer") {
            targetWindow?.webContents.send("accept-warm-transfer", {
              callSid: toastMessage.callSid,
              fromUsername: toastMessage.fromNumber,
              targetUsername: toastMessage.targetUsername,
            });
          }
        } else if (action === "secondary") {
          if (toastMessage.toastType === "call") {
            targetWindow?.webContents.send("decline-incoming-call", {
              callSid: toastMessage.callSid,
              fromNumber: toastMessage.fromNumber,
            });
          } else if (toastMessage.toastType === "warm-transfer") {
            targetWindow?.webContents.send("decline-warm-transfer", {
              callSid: toastMessage.callSid,
              fromUsername: toastMessage.fromNumber,
              targetUsername: toastMessage.targetUsername,
            });
          }
        }
      }
    );

    ipcMain.on("toast-close-request", (event) => {
      const toastWindow = BrowserWindow.fromWebContents(event.sender);
      if (toastWindow) {
        this.toastWindows.delete(toastWindow);
        toastWindow.close();
        this.positionToastWindows();
      }
    });
  }

  findTargetWindow(sourceWindow) {
    // If source is a toast window, find its parent
    const parentWindow = sourceWindow.getParentWindow();
    if (parentWindow) return parentWindow;

    // Otherwise return the window that created this manager
    return this.parentWindow;
  }

  createToastWindow(message, sourceWindow) {
    const toastWindow = new BrowserWindow({
      width: 320,
      height: 110,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      parent: sourceWindow || this.parentWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    toastWindow.loadFile(path.join(__dirname, "toast.html"));

    toastWindow.webContents.on("did-finish-load", () => {
      toastWindow.webContents.send("set-toast-content", message);
    });

    this.toastWindows.add(toastWindow);
    this.positionToastWindows();

    // Auto-close after timeout
    setTimeout(() => {
      if (!toastWindow.isDestroyed()) {
        this.toastWindows.delete(toastWindow);
        toastWindow.close();
        this.positionToastWindows();
      }
    }, message.autoDeclineAfterMs || 60000);
  }

  positionToastWindows() {
    const { screen } = require("electron");
    const { workArea } = screen.getPrimaryDisplay();
    const margin = 10;
    let yOffset = workArea.y + margin;

    for (const win of this.toastWindows) {
      if (!win.isDestroyed()) {
        win.setPosition(
          workArea.width - win.getBounds().width - margin,
          yOffset
        );
        yOffset += win.getBounds().height + margin;
      }
    }
  }

  cleanup() {
    // Remove all IPC listeners
    ipcMain.removeAllListeners("show-toast");
    ipcMain.removeAllListeners("toast-action-clicked");
    ipcMain.removeAllListeners("toast-close-request");

    // Close all toast windows
    for (const win of this.toastWindows) {
      if (!win.isDestroyed()) {
        win.close();
      }
    }
    this.toastWindows.clear();
  }
}

module.exports = ToastWindowManager;
