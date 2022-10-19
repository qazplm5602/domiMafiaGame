let GameResult = new Array();
GameResult.music;

CallBack["gameresult.init"] = function(data) {
    let winMafia = data.mafia;
    let playTime = new Date(data.time);

    const minutes = playTime.getMinutes();
    const secounds = playTime.getSeconds();
    $(".gameresult-list-time > span").text(minutes.toString().padStart(2, "0")+":"+secounds.toString().padStart(2, "0"));
    $(".gameresult-list-status.win").removeClass("win");
    if (winMafia) {
        $(".gameresult-list-status.mafia").addClass("win").find("div").text("WIN");
        $(".gameresult-list-status.citizen > div").text("LOSS");
    } else {
        $(".gameresult-list-status.citizen").addClass("win").find("div").text("WIN");
        $(".gameresult-list-status.mafia > div").text("LOSS");
    }

    // 애니메이션 시작
    $("#gameresult-screen").show();
    $(".gameresult-animatetext").attr("style","").css({transition:"1.5s opacity, 1.5s transform"}).show();
    setTimeout(() => {
        $(".gameresult-animatetext").css({opacity:1,transform:"translate(-50%,-50%) scale(1.5)"});
        setTimeout(() => {
            $(".gameresult-animatetext").css({transition:"500ms opacity, 500ms transform"});
            $(".gameresult-animatetext").css({opacity:0,transform:"translate(-50%,-50%) scale(2.5)"});

            setTimeout(() => {
                $(".gameresult-animatetext").attr("style","");
                $(".gameresult-background").fadeIn(300);
                $(".gameresult-list").css("display","flex");
                $(".gameresult-close").show();
            },500);
        },1500);
    },10);

    // 사운드
    let audio = GameResult.music = new Audio("../assets/gameResult/sounds/LCKvictory.mp3");
    audio.volume = 0.3;
    audio.play();
}

GameResult.close = function() {
    if (GameResult.music !== undefined) {
        GameResult.music.pause();
        GameResult.music = undefined;
    }
    $("#gameresult-screen").hide();
    $(".gameresult-background").hide();
    $(".gameresult-list").hide();
    $(".gameresult-close").hide();

    // 로비로 변경
    $("#lobby-screen").show();
    $("#gamemain-screen").hide();
    $(".gamemain-jobcard").hide();
    $("#userinfo-money").html(`<span class="money">현금</span>0원`);
    $(".gamemain-players").empty();
    $(".gamemain-header-count").html(`
    <span>밤이 되기까지 남은시간</span>
    <span id="timeout-count">00:00</span>
    `);
    $(".gamemain-chat-list").empty();
    workNPC.hide();
    inventory.close();
    inventory.myitem = {};
}