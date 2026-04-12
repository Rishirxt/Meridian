const path = require('path');
const { app, BrowserWindow } = require('electron');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, isDev ? 'logo512.png' : '../build/logo512.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // Adjust according to your security needs
        },
    });

    // Check if we are in development or production
    // In dev, load localhost. In prod, load the local index.html file
    win.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );

    // Open the DevTools automatically if in dev mode
    if (isDev) {
        win.webContents.openDevTools({ mode: 'detach' });
    }
}

// When Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
