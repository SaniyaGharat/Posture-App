const { app, BrowserWindow, Tray, Menu, Notification, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;
let heartbeatInterval = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 800,
        backgroundThrottling: false, // Critical: Stops Chromium from sleeping
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: "PostureGuard AI",
        backgroundColor: '#0f0f0f'
    });

    mainWindow.loadFile('index.html');

    // START THE SYSTEM HEARTBEAT
    // This sends a signal to the renderer every 100ms to force AI processing
    heartbeatInterval = setInterval(() => {
        if (mainWindow) {
            mainWindow.webContents.send('do-ai-tick');
        }
    }, 100);

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
    });
}

function createTray() {
    tray = new Tray({
        icon: path.join(__dirname, 'icon.png'),
        tooltip: 'PostureGuard AI is Monitoring'
    });

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: () => mainWindow.show() },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
    ]);

    tray.setContextMenu(contextMenu);
}

ipcMain.on('notify', (event, { title, body }) => {
    new Notification({ title, body }).show();
});

app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
