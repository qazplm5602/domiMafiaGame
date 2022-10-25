const { ipcMain, BrowserWindow } = require("electron/main");
const main = require("../main.js");
// const MainLogin = require("./MainLogin.js");

exports.InitWindow = token => {
    let window = new BrowserWindow({
        width:1600,
        height:900,
        center:true,
        minWidth:1000,
        minHeight:600,
        show:false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true
        }
    });
    window.webContents.addListener("dom-ready", () => {
        // 모든 창 닫기
        let Allwindows = BrowserWindow.getAllWindows();
        Allwindows.forEach(win => {
            if (win !== window) {
                win.close();
            }
        });

        window.webContents.send("main.SetToken",token);
        window.show();
        window.focus();
    });
    window.setMenuBarVisibility(false);
    window.loadFile("./ui/mafia/index.html");
}

ipcMain.once("gamemain.panic", (event,why) => {
    main.panic(why);
});