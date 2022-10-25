const { app, ipcMain, BrowserWindow } = require("electron");
const MainLogin = require("./MainLogin.js");

// 창 닫기
ipcMain.on('closeApp', () => {
    app.quit();
});

ipcMain.on('minimzieApp', (event) => {
    const THISwindow = BrowserWindow.getAllWindows().find((win) => win.webContents.id === event.sender.id);
    THISwindow.minimize();
});


ipcMain.on('logoutApp', () => {
    MainLogin.LoginInit();
});