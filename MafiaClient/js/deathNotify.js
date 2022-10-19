CallBack["deathNotify.show"] = function() {
    // 초기화
    $("#death-notify").css({transition:"all 250ms",transform: "translate(-50%,0) scale(1.2)",opacity:0}).show();
    
    setTimeout(() => {
        $("#death-notify").css({opacity:1,transform: "translate(-50%,0)"});
    },10);
    setTimeout(() => {
        $("#death-notify").css({opacity:0,transform: "translate(-50%,0) scale(0.8)"});
        setTimeout(() => {
            $("#death-notify").attr("style","");
        },250)
    }, 5000);
}
