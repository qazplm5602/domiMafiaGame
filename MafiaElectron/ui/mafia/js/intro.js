let { ipcRenderer } = require('electron');
let Intro = new Array();
Intro.token;

Intro.ServerConnecting = () => {
    $("#intro-progress-text").text("서버 연결중");
    ServerLogin(Intro.token);
}

Intro.init = () => {
    $("#intro-screen").show();
    $("#intro-progress-text").text("서버에 접속하려면 아무 키나 누르세요.");
    window.addEventListener('keydown',Intro.ServerConnecting, { once: true })
}

ipcRenderer.once("main.SetToken", (event,token) => {
    Intro.token = token;
    Intro.init();
});