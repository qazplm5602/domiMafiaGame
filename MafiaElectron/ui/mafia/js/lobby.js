let Lobby = new Array();
Lobby.ReadySound;

Lobby.playerAdd = userdata => {
    $(".lobby-players").append(`
    <div class="player-box" id="lobby-player-${userdata.id}">
        <img class="player-avater" src="./assets/logo/domi.png">
        <span class="player-status ${userdata.ready == true ? "active" : ""}">${userdata.ready == true ? "준비" : "준비안함"}</span>
        <div class="player-name">${escapeHtml(userdata.name)}</div>
    </div>
    `);
}

$(function() {
    // 준비
    $("#lobby-ready").click(function() {
        let isReady = $(this).hasClass("active");
        
        isReady = !isReady;
        if (isReady) {
            $(this).text("준비해제").addClass("active");
        } else {
            $(this).text("준비").removeClass("active");
        }

        socket.send("lobby.SetReady",{ready:isReady});
    });
})

CallBack["lobby.Init"] = function(data) {
    let players = data.players;

    $(".lobby-players").empty();
    $(".lobby-chat-content").empty();
    $(".lobby-chat-content").hide();
    $(".lobby-chat-input").val("");
    $("#lobby-ready").removeClass("active").text("준비");

    // 플레이어 리스트
    players.forEach(player => {
        Lobby.playerAdd(player);
    });

    $("#intro-screen").hide();
    $("#lobby-screen").show();
}

// 플레이어 추가
CallBack["lobby.joinplayer"] = function(data) {
    Lobby.playerAdd(data);
    LobbyChat.add(null,data.name+"님이 접속하였습니다.");
}

// 플레이어 제거
CallBack["lobby.leaveplayer"] = function(data) {
    $("#lobby-player-"+data.id).remove();
    LobbyChat.add(null,data.name+"님이 퇴장하였습니다.");
}

// 준비 상태
CallBack["lobby.setUserReady"] = function(data) {
    const $element = $("#lobby-player-"+data.id);

    if (data.ready) {
        $element.find(".player-status").addClass("active").text("준비");
    } else {
        $element.find(".player-status").removeClass("active").text("준비안함");
    }
}

// 시작대기 화면
CallBack["lobby.gameReady"] = function() {
    if (Lobby.ReadySound !== undefined) {
        Lobby.ReadySound.pause();
        Lobby.ReadySound = undefined;
    }

    Lobby.ReadySound = new Audio("./assets/intro/sounds/gameReady.mp3");
    Lobby.ReadySound.volume = 0.3;
    Lobby.ReadySound.play();

    $(".lobby-ready-screen").fadeIn(200);
    $("#ready-start-text").css({transform:"translate(-50%,-50%)",opacity:1});

    for (let count = 11; count > 0; count --) {
        setTimeout(() => {
            $("#ready-start-count").css({opacity:1}).text(count - 1);
        }, 1000 * (12 - count));
    }

}