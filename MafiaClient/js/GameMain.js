CallBack["gamemain.init"] = function(data) {
    if (Lobby.ReadySound !== undefined) {
        Lobby.ReadySound.pause();
        Lobby.ReadySound = undefined;
    }

    $("#lobby-screen").hide();
    $(".player-status.active").removeClass("active").text("준비안함");
    $("#lobby-ready").text("준비").removeClass("active");
    $(".gamemain-jobcard").hide();
    $("#userinfo-money").html(`<span class="money">현금</span>0원`);
    $(".lobby-ready-screen").hide();
    $("#ready-start-count").attr("style","");
    $("#ready-start-text").attr("style","");
    $(".gamemain-chat-list").empty();
    $(".gamemain-header-count > span").first().text("밤이 되기까지 남은시간");
    $("#gamemain-screen").attr("style","");

    // 유저 표시
    $(".gamemain-players").empty();
    $.each(data.players, function(_,player) {
        $(".gamemain-players").append(`
            <div class="gamemain-player" id="gamemain-player-${player.id}">
                <img class="gamemain-player-avater" src="./assets/logo/domi.png">
                <div class="gamemain-player-name" style="${player.id === data.myid ? `color:#3a8f37;` : ""}">${escapeHtml(player.name)}</div>
                ${player.id !== data.myid ? `<textarea placeholder="메모"></textarea>` : ""}
            </div>
        `);
    });

    $("#gamemain-screen").show();

    // 관전자
    if (data.spectator === true) {
        $("#userinfo-job").html("<span>직업</span>"+"관전자");
        return;
    }

    // 직업
    $.getJSON("../assets/character/list.json",function(avatar) {
        // 크래쉬
        if (avatar === undefined) {
            console.error("캐릭터 리스트를 불러올 수 없습니다.");
            return;
        }
        
        let character = avatar[data.job];

        // 크래쉬
        if (character === undefined) {
            console.error("캐릭터 데이터가 없습니다. / Index: "+data.job);
            return;
        }

        $(".gamemain-jobcard > img").attr("src","./assets/character/avatar/"+data.job+"."+character.icon);
        $(".gamemain-jobcard-name").text(character.name);
        $(".gamemain-jobcard-subtext").text(character.explanation);
        $("#userinfo-job").html("<span>직업</span>"+character.name);
        let audio = new Audio("../assets/gameMain/sounds/jobcardshow.mp3");
        audio.volume = 0.2;
        audio.currentTime = 0.55;
        audio.play();
        $(".gamemain-jobcard").show();
        $(".gamemain-jobcard").delay(5000).fadeOut(1000);
    });
}

CallBack["gamemain.playerdied"] = function(data) {
    let id = data.id;

    $("#gamemain-player-"+id).css({transition:"1s all"});
    $("#gamemain-player-"+id).css({filter:"grayscale(100%)",transform: "scale(0.8)",opacity:0.0});
    setTimeout(() => {
        $("#gamemain-player-"+id).remove();
    }, 1000);
}

CallBack["gamemain.moneyChange"] = function(data) {
    $("#userinfo-money").html(`<span class="money">현금</span>${numberWithCommas(data.value)}원`);
}