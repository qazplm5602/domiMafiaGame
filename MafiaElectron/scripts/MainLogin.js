const { ipcMain, BrowserWindow } = require("electron");
const MainGame = require("./MainGame.js");
const request = require("request");

let nowWindow;
exports.nowWindow = nowWindow;

exports.LoginInit = () => {
    // 모든 창 닫기
    let Allwindows = BrowserWindow.getAllWindows();
    Allwindows.forEach(window => {
        window.close();
    });

    // 로그인 창 띄우기
    nowWindow = new BrowserWindow({
        width: 1600,
        height: 850,
        center: true,
        resizable: false,
        frame: false,
        transparent:true,
        show:false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false
        }
    });
    nowWindow.webContents.once("dom-ready", () => {
        nowWindow.show();
        nowWindow.focus();
    });
    nowWindow.setMenuBarVisibility(false);
    nowWindow.loadFile("./ui/Login/Login.html");
}

ipcMain.on('MainLogin',(evnet,user) => {
    const ServerOption = {
        uri:"https://mafia.domi.kr/login",
        method: 'POST',
        json: true,
        body: {
            id:user.id,
            password:user.password
        }
    }

    request.post(ServerOption,function(err,httpResponse,body){
        if (err) {
            evnet.reply('MainLoginError','서버와 연결할 수 없습니다.');
            return;
        }
        if (httpResponse.statusCode != 200) {
            evnet.reply('MainLoginError','서버에 오류가 발생하였습니다. '+httpResponse.statusCode);
            return;
        }

        if (!body) {
            evnet.reply('MainLoginError','서버의 요청을 읽을 수 없습니다.');
            return;
        }

        if (body.error) {
            evnet.reply('MainLoginError',body.error);
            return;
        }

        if (body.token === undefined) {
            evnet.reply('MainLoginError','지정된 토큰이 없습니다.');
            return;
        }

        evnet.reply('LoginStartScreen',body.name);
        setTimeout(() => MainGame.InitWindow(body.token), 3000);
        
    });
});

// 첫빠다 실행
exports.LoginInit();