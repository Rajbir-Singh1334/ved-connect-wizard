const { app, BrowserWindow, ipcMain, Menu } = require("electron")
const path = require("path")
const isDev = require("electron-is-dev")
const { spawn } = require("child_process")
const os = require("os")

let mainWindow
let adbProcess = null
let scrcpyProcess = null

const isProd = !isDev && process.env.NODE_ENV === "production"
const startUrl = isProd ? `file://${path.join(__dirname, "../../out/index.html")}` : "http://localhost:3000"

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
    },
    icon: path.join(__dirname, "../../public/icon.png"),
  })

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on("closed", () => {
    mainWindow = null
    cleanupProcesses()
  })
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.handle("detect-devices", async () => {
  return new Promise((resolve) => {
    const adb = spawn("adb", ["devices"])
    let output = ""

    adb.stdout.on("data", (data) => {
      output += data.toString()
    })

    adb.on("close", (code) => {
      if (code === 0) {
        const lines = output.split("\n").slice(1)
        const devices = lines
          .filter((line) => line.trim() && !line.includes("attached"))
          .map((line) => {
            const [id, status] = line.split(/\s+/)
            return { id: id.trim(), status: status?.trim() || "offline" }
          })
        resolve({ success: true, devices })
      } else {
        resolve({ success: false, error: "ADB not found or failed", devices: [] })
      }
    })

    adb.on("error", () => {
      resolve({ success: false, error: "Failed to execute ADB", devices: [] })
    })

    // Timeout after 5 seconds
    setTimeout(() => {
      adb.kill()
      resolve({ success: false, error: "ADB detection timeout", devices: [] })
    }, 5000)
  })
})

ipcMain.handle("enable-wireless", async (event, deviceId) => {
  return new Promise((resolve) => {
    // Enable wireless debugging on the device
    const cmd = spawn("adb", ["-s", deviceId, "tcpip", "5555"])
    let output = ""
    let errorOutput = ""

    cmd.stdout.on("data", (data) => {
      output += data.toString()
    })

    cmd.stderr.on("data", (data) => {
      errorOutput += data.toString()
    })

    cmd.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true, message: "Wireless debugging enabled" })
      } else {
        resolve({ success: false, error: errorOutput || "Failed to enable wireless" })
      }
    })

    cmd.on("error", (err) => {
      resolve({ success: false, error: err.message })
    })

    setTimeout(() => {
      cmd.kill()
      resolve({ success: false, error: "Command timeout" })
    }, 10000)
  })
})

ipcMain.handle("get-device-ip", async (event, deviceId) => {
  return new Promise((resolve) => {
    const cmd = spawn("adb", ["-s", deviceId, "shell", "ip", "addr", "show"])
    let output = ""

    cmd.stdout.on("data", (data) => {
      output += data.toString()
    })

    cmd.on("close", (code) => {
      if (code === 0) {
        const ipMatch = output.match(/inet\s+(192\.\d+\.\d+\.\d+)/)
        const ip = ipMatch ? ipMatch[1] : null
        if (ip) {
          resolve({ success: true, ip })
        } else {
          resolve({ success: false, error: "Could not retrieve device IP" })
        }
      } else {
        resolve({ success: false, error: "Failed to get device IP" })
      }
    })

    cmd.on("error", (err) => {
      resolve({ success: false, error: err.message })
    })

    setTimeout(() => {
      cmd.kill()
      resolve({ success: false, error: "Command timeout" })
    }, 10000)
  })
})

ipcMain.handle("connect-wireless", async (event, ip, port = "5555") => {
  return new Promise((resolve) => {
    const cmd = spawn("adb", ["connect", `${ip}:${port}`])
    let output = ""
    let errorOutput = ""

    cmd.stdout.on("data", (data) => {
      output += data.toString()
    })

    cmd.stderr.on("data", (data) => {
      errorOutput += data.toString()
    })

    cmd.on("close", (code) => {
      const result = output + errorOutput
      if (code === 0 && result.includes("connected")) {
        resolve({ success: true, message: "Connected to wireless device" })
      } else {
        resolve({ success: false, error: result || "Failed to connect" })
      }
    })

    cmd.on("error", (err) => {
      resolve({ success: false, error: err.message })
    })

    setTimeout(() => {
      cmd.kill()
      resolve({ success: false, error: "Connection timeout" })
    }, 10000)
  })
})

ipcMain.handle("launch-scrcpy", async (event, deviceId, options = {}) => {
  return new Promise((resolve) => {
    const args = ["-s", deviceId]

    if (options.maxSize) args.push("-m", options.maxSize.toString())
    if (options.bitRate) args.push("-b", options.bitRate)
    if (options.orientation) args.push("--orientation", options.orientation)

    scrcpyProcess = spawn("scrcpy", args)

    scrcpyProcess.on("error", (err) => {
      scrcpyProcess = null
      resolve({ success: false, error: `Failed to launch scrcpy: ${err.message}` })
    })

    scrcpyProcess.on("close", (code) => {
      scrcpyProcess = null
      if (code === 0) {
        resolve({ success: true, message: "Scrcpy started successfully" })
      }
    })

    // Assume success if process starts
    setTimeout(() => {
      if (scrcpyProcess) {
        resolve({ success: true, message: "Scrcpy launched" })
      }
    }, 1000)
  })
})

ipcMain.handle("stop-scrcpy", async () => {
  return new Promise((resolve) => {
    if (scrcpyProcess) {
      scrcpyProcess.kill()
      scrcpyProcess = null
      resolve({ success: true, message: "Scrcpy stopped" })
    } else {
      resolve({ success: true, message: "Scrcpy not running" })
    }
  })
})

ipcMain.handle("disconnect-device", async (event, ip) => {
  return new Promise((resolve) => {
    const cmd = spawn("adb", ["disconnect", ip])

    cmd.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true, message: "Device disconnected" })
      } else {
        resolve({ success: false, error: "Failed to disconnect" })
      }
    })

    cmd.on("error", (err) => {
      resolve({ success: false, error: err.message })
    })

    setTimeout(() => {
      cmd.kill()
      resolve({ success: false, error: "Disconnect timeout" })
    }, 5000)
  })
})

function cleanupProcesses() {
  if (adbProcess) {
    adbProcess.kill()
    adbProcess = null
  }
  if (scrcpyProcess) {
    scrcpyProcess.kill()
    scrcpyProcess = null
  }
}

app.on("before-quit", cleanupProcesses)
