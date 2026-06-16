const { app, BrowserWindow, Menu, Tray, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Fix for GPU crash with transparent windows
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

// Initialize store for settings
const store = new Store({
  defaults: {
    windowBounds: { width: 320, height: 480, x: 100, y: 100 },
    alwaysOnTop: true,
    theme: 'dark'
  }
});

let mainWindow;
let tray;
let isQuitting = false;

function createWindow() {
  // Get stored window bounds or use defaults
  const bounds = store.get('windowBounds');
  const alwaysOnTop = store.get('alwaysOnTop', true);

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 280,
    minHeight: 400,
    frame: false,
    transparent: true,
    alwaysOnTop: alwaysOnTop,
    resizable: true,
    skipTaskbar: false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, '..', 'assets', 'icon.ico'), // Set application icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the app
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Handle window events
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }

    // Save window bounds
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      store.set('windowBounds', bounds);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Make window draggable from anywhere
  mainWindow.setMovable(true);

  // Development tools
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '..', 'assets', 'icon.ico');
  let trayIcon;

  try {
    trayIcon = nativeImage.createFromPath(iconPath);

    if (trayIcon.isEmpty()) {
      // Fallback to screenshot if icon doesn't exist
      const pngPath = path.join(__dirname, '..', 'assets', 'screenshot.png');
      trayIcon = nativeImage.createFromPath(pngPath).resize({ width: 16, height: 16 });
    }

    if (trayIcon.isEmpty()) {
      console.log('No valid icon found for tray');
      return;
    }

    tray = new Tray(trayIcon);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => mainWindow.show()
      },
      {
        label: 'Quit',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip('flost8');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    });

  } catch (error) {
    console.error('Failed to create tray:', error);
  }
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running in tray
  }
});

// IPC handlers
ipcMain.handle('get-store-value', (event, key, defaultValue) => {
  return store.get(key, defaultValue);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('toggle-always-on-top', () => {
  const current = mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(!current);
  store.set('alwaysOnTop', !current);
  return !current;
});

ipcMain.handle('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.handle('close-window', () => {
  mainWindow.close();
});

ipcMain.handle('get-screen-size', () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  return primaryDisplay.workAreaSize;
});
