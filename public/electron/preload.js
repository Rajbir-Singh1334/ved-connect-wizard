const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("vedConnect", {
  detectDevices: () => ipcRenderer.invoke("detect-devices"),
  enableWireless: (deviceId) => ipcRenderer.invoke("enable-wireless", deviceId),
  getDeviceIp: (deviceId) => ipcRenderer.invoke("get-device-ip", deviceId),
  connectWireless: (ip, port) => ipcRenderer.invoke("connect-wireless", ip, port),
  launchScrcpy: (deviceId, options) => ipcRenderer.invoke("launch-scrcpy", deviceId, options),
  stopScrcpy: () => ipcRenderer.invoke("stop-scrcpy"),
  disconnectDevice: (ip) => ipcRenderer.invoke("disconnect-device", ip),
})
