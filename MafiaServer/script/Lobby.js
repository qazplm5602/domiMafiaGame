const gameCore = require("./GameCore.js");
const UserManager = require("./UserManager.js");

exports.JoinLobby = id => {
    const user = MafiaUsers[id];

    // 로비 설정 (개인)
    let LobbyList = new Array();

    for (const player in MafiaUsers) {
        if (id !== player) { // 나 외의 사람들
            let PlayerData = MafiaUsers[player];
            LobbyList.push({
                id: player,
                name: PlayerData.name,
                ready: PlayerData.LobbyReady
            });
        }
    }

    user.ws.send("lobby.Init",{players:LobbyList});

    // 모두에게 접속 알림
    gameCore.allPlayerSend("lobby.joinplayer",{
        id : id,
        name: user.name,
        ready: user.LobbyReady
    });

    if (gameCore.isStart()) {
        // 관전자로 설정
        MafiaUsers[id].died = true;
        gameCore.spectatorScreenInit(id);
    }
}

exports.LeaveLobby = id => {
    const user = MafiaUsers[id];

    // 게임이 진행중인 경우
    if (gameCore.isStart()) {
        gameCore.playerKill(id);
        gameCore.gameIfStop();
    }

    // 모두에게 알림
    gameCore.allPlayerSend("lobby.leaveplayer",{
        id : id,
        name: user.name
    });
}

// 준비
ClientTrigger["lobby.SetReady"] = function(id,data) {
    const user = MafiaUsers[id];
    if (user === undefined || data.ready === undefined) return;
    if (user.LobbyReady === data.ready) return;
    if (gameCore.isStart()) return;

    user.LobbyReady = !user.LobbyReady;
    gameCore.allPlayerSend("lobby.setUserReady",{
        id : id,
        ready: user.LobbyReady
    });

    // 게임 시작 가능여부
    if (UserManager.AllPlayerReady() === false) return;
    if (UserManager.AllPlayersNum() <= 4) {
        gameCore.allPlayerSend("lobby.SystemChat",{
            content: "인원이 5명 이상이여야 게임시작이 가능합니다."
        });
        return;
    }

    gameCore.GameStart();
}

ClientTrigger["lobby.chatSend"] = function(id,data) {
    const user = MafiaUsers[id];
    if (user === undefined || user.name === undefined || data.content === undefined || data.content === "") return;

    gameCore.allPlayerSend("lobby.UserChat",{
        name: user.name,
        content: data.content
    });
}