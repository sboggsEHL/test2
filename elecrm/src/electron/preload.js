const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getEnv: (key) => ipcRenderer.invoke("get-env", key),
  sendLoginSuccess: () => ipcRenderer.send("login-success"),
  openSoftphoneWindow: () => ipcRenderer.send("open-softphone-window"),
  updateSharedState: (newState) => {
    ipcRenderer.send("update-shared-state", newState);
  },
  onSharedState: (callback) => {
    console.log("[preload] Setting up state listener");
    // Use different events for main vs softphone
    const channel = window.location.hash.includes('softphone') 
      ? "softphone-state-update"
      : "shared-state";
      
    ipcRenderer.on(channel, (_, state) => {
      console.log(`[preload] State received on ${channel}:`, state);
      callback(state);
    });
  },
  getSharedState: async () => {
    try {
      console.log("[preload] Requesting shared state");
      // Request state from main process
      ipcRenderer.send("request-shared-state");
      return await ipcRenderer.invoke("get-shared-state");
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  dialPhoneNumber: (phoneNumber, leadData) => {
    ipcRenderer.send('dial-phone-number', { phoneNumber, leadData });
  },
  onDialPhoneNumber: (callback) => {
    ipcRenderer.on('dial-number', (_event, data) => callback(data));
  },
  isElectron: true,
  updateSharedState: (newState) => ipcRenderer.send("update-shared-state", newState)
});

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  },
});
