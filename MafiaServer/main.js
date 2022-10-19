const express = require('express');
const app = global.expressAPP = express()

//Express 4.16.0버전 부터 body-parser의 일부 기능이 익스프레스에 내장 body-parser 연결 
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

const server = require('http').createServer(app);
const WebSocket = require('ws');

// 임시 변수 (다른 파일로 옮겨질 예정)
global.MafiaUsers = new Array();
global.ClientTrigger = new Array();

const wss = new WebSocket.Server({ server:server });
wss.on("connection", (ws,request) => {
    // IP 
    let ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7);
    }

    ws.kick = (reason) => {
        ws.close(1000,reason);
    }
    ws.oldSend = ws.send;
    ws.send = function(type,data) {
        let senddata = data || {};
        senddata.type = type;
        
        ws.oldSend(JSON.stringify(senddata));
    }

    let usertoken = ws.protocol;
    if (usertoken === undefined || usertoken.length <= 0) {
        ws.kick("토큰값이 유효하지 않습니다.");
        return;
    }
    let userdata;
    if (usertoken !== "domitest8520!") { // 테스트
        let Login = require("./script/Login.js");
        userdata = Login.getTokenData(usertoken);
        if (userdata === undefined) {
            ws.kick("유효기간이 만료된 토큰이거나 잘못되었습니다.");
            return;
        }
    } else {
        const makeid = (length) => {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
              result += characters.charAt(Math.floor(Math.random() * 
         charactersLength));
           }
           return result;
        }
        let ranT = makeid(5);
        userdata = {
            id: "testaccount-"+ranT,
            name: "도미테스트계정-"+ranT,
            time: new Date()
        }
    }

    // 이미 로그인중
    if (global.MafiaUsers[userdata.id] !== undefined) {
        global.MafiaUsers[userdata.id].ws.kick("다른 클라이언트로 로그인 하였습니다.");   
        delete global.MafiaUsers[userdata.id];
    }

    let MafiaPlayer = require("./script/MafiaPlayer.js");
    global.MafiaUsers[userdata.id] = new MafiaPlayer(ws,userdata.name);

    ws.send("welcome.domiserver",{name:userdata.name});
    Lobby.JoinLobby(userdata.id);

    console.log("[LoginManager] "+userdata.name+" 로그인.");

    ws.on("message", value => {
        let data;
        
        try {
            data = JSON.parse(value);
        } catch {}
        if (data === undefined || typeof(data.type) !== "string") return;
                
        let callback = global.ClientTrigger[data.type];
        if (typeof(callback) !== "function") {
            ws.kick("잘못된 트리거를 요청하였습니다. Client -> Server / "+data.type);
            // console.log("[main] 트리거를 찾을 수 없습니다. Client -> Server / "+data.type);
            return;
        }

        callback(userdata.id,data);
    });
    ws.once("close", () => {
        if (ws !== global.MafiaUsers[userdata.id].ws) return;

        Lobby.LeaveLobby(userdata.id);
        delete global.MafiaUsers[userdata.id];

        console.log("[LoginManager] "+userdata.name+" 나감.");
    });
});

// 파일 불러오기
require("./script/Login.js");
require("./script/GameCore.js");
const Lobby = require("./script/Lobby.js");
require("./script/Game-chat.js");
require("./script/GameitemSHOP.js");

server.listen(3000, () => {
    console.log(`[main] 서버가 작동중입니다. Port : 3000`);
});