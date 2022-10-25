const { app, dialog, BrowserWindow } = require("electron");

const gotTheLock = app.requestSingleInstanceLock()
const init_scripts = [
    "window-button",
    "MainLogin",
    "MainGame"
];

if (!gotTheLock) { // 이미 실행중
    app.quit();
} else {
    app.whenReady().then(() => {
        init_scripts.forEach(name => require("./scripts/"+name+".js"));
    });
}

// 오류 띄워버리기
exports.panic = (why) => {
    // 모든 창 닫기
    let Allwindows = BrowserWindow.getAllWindows();
    Allwindows.forEach(win => {
        win.destroy();
    });

    const options = {
        type: 'error',
        buttons: ['네', '아니요'],
        defaultId: 1,
        title: 'domiMafiaClient Crash',
        message: '예기치 못한 오류가 발생하였습니다.\n다시 실행하시겠습니까?',
        detail: why
    };

    let result = dialog.showMessageBoxSync(null,options);
    if (result === 0) {
        app.relaunch();
        app.exit();
    } else {
        app.quit();
    }
}

// app.on("will-quit", async (event) => {
//     const { spawn } = require("child_process");
//     const path = require("path");
//     const folder = path.join(app.getPath("appData"), app.name);
  
//     // Wait 3 seconds, navigate into your app folder and delete all files/folders
//     const cmd = `ping localhost -n 3 > nul 2>&1 && pushd "${folder}" && (rd /s /q "${folder}" 2>nul & popd)`;
    
//     // shell = true prevents EONENT errors
//     // stdio = ignore allows the pipes to continue processing w/o handling command output
//     // detached = true allows the command to run once your app is [completely] shut down
//     const process = spawn(cmd, { shell: true, stdio: "ignore", detached: true });
  
//     // Prevents the parent process from waiting for the child (this) process to finish
//     process.unref();
//   });