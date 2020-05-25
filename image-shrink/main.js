const path = require('path');
const os = require('os');
const imagemin = require('imagemin');
const imageminMozJpeg = require('imagemin-mozjpeg');
const imageminPngQuant = require('imagemin-pngquant');
const slash = require('slash');
const log = require('electron-log');
const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell,
} = require('electron');

process.env.NODE_ENV = 'production';
const isDev = process.env.NODE_ENV === 'development' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;
const menuTemplate = [
  {
    //one way of defining menu template
    //   label: 'File',
    //   submenu: [
    //     {
    //       label: 'Quit',
    //       accelerator: 'CmdOrCtrl+W',
    //       click: () => app.quit(),
    //     },
    //   ],
    //second way of defining menu template with the help of roles

    role: 'fileMenu',
  },
  ...(isDev
    ? {
        label: 'Developer',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },
        ],
      }
    : []),
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: createaboutWindow,
      },
    ],
  },
];
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev ? true : false,
    center: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile(`${__dirname}/app/index.html`);
}
function createaboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: 'About Image Shrink',
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    center: true,
  });
  aboutWindow.removeMenu();
  aboutWindow.loadFile(`${__dirname}/app/about.html`);
}
// require('electron-reload')(__dirname, {
//   electron: path.join(__dirname, 'node_modules/.bin/electron.cmd'),
//   hardResetMethod: 'exit',
// });
ipcMain.on('image', (e, data) => {
  data.dest = path.join(os.homedir(), 'ImageShrink');
  shrinkImage(data);
});
async function shrinkImage({ filePath, value, dest }) {
  try {
    const file = await imagemin([slash(filePath)], {
      destination: dest,
      plugins: [
        imageminMozJpeg({ quality: value }),
        imageminPngQuant({ quality: [value / 100, value / 100] }),
      ],
    });
    mainWindow.webContents.send('done');
    shell.openPath(dest);
    log.info('image resized sucessfully', file);
  } catch (err) {
    log.error('error occured while resizing image', ex);
  }
}
app.on('ready', () => {
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload());
  globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I', () =>
    mainWindow.toggleDevTools()
  );
  createMainWindow();
  mainWindow.on('close', () => (mainWindow = null));
});

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
