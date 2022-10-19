CallBack["timer.setText"] = function(data) {
    let time = data.time;

    const minutes = Math.floor(time / 60);
    const secounds = time - (minutes * 60);
    $("#timeout-count").text(minutes.toString().padStart(2, "0")+":"+secounds.toString().padStart(2, "0"));
}

// 밤으로 변경
CallBack["gamemain.ChangeNight"] = function() {
    $("#gamemain-screen").css({background:`url("../assets/gameMain/time/night.svg") no-repeat`
    ,"background-size":"cover",
    "background-position":"center"});
    
    $(".gamemain-header-count").fadeOut(300,function() {
        $(this).find("span").first().text("낮이 되기까지 남은시간");
        $(this).fadeIn(300);
    });
}
// 낮으로 변경
CallBack["gamemain.ChangeMorning"] = function() {
    $("#gamemain-screen").css({background:`url("../assets/gameMain/time/morning.svg") no-repeat`
    ,"background-size":"cover",
    "background-position":"center"});
    
    $(".gamemain-header-count").fadeOut(300,function() {
        $(this).find("span").first().text("밤이 되기까지 남은시간");
        $(this).fadeIn(300);
    });
}