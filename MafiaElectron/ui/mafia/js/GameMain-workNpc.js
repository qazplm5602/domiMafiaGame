let workNPC = new Array();
workNPC.messageDelay = new Array();

workNPC.show = () => {
    $("#work-npc-main").show();
    workNPC.Setbutton(true);
    workNPC.Setmessage("일자리 알아보고 있어 구리?");

    // 너굴사장 이펙트
    $(".work-npc-avatar").css({left:"-100px",opacity:0}).animate({
        left:0,
        opacity:1
    },250,'swing');

    // 너굴사장 이름 이펙트
    $(".work-npc-name").css({left:"-205px"}).delay(100).animate({
        left:0
    },300,'swing');
}

workNPC.hide = () => {
    $("#work-npc-main").hide();
    $(".work-npc-content").empty();
}

workNPC.Setmessage = message => {
    if (workNPC.messageDelay.length > 0) {
        workNPC.messageDelay.forEach(element => {
            clearTimeout(element);
        });
        workNPC.messageDelay = new Array();
    }

    $(".work-npc-content").empty();

    for (let i = 0; i < message.length; i++) {
        let id = setTimeout(() => {
            let nowText = $(".work-npc-content").text();
            $(".work-npc-content").text(nowText+message[i]);
        }, 80 * i);

        workNPC.messageDelay.push(id);
    }
}

workNPC.Setbutton = value => {
    if (value) {
        $(".work-npc-buttons").fadeIn(200);
    } else {
        $(".work-npc-buttons").fadeOut(200);
    }
}

workNPC.Reset = () => {
    workNPC.Setmessage("일자리 알아보고 있어 구리?");
    workNPC.Setbutton(true);
}

workNPC.onFishiButton = () => {
    workNPC.Setmessage("취소하고 싶다면 BACKSPACE를 눌러 구리.");
    workNPC.Setbutton(false);
    MinigameFish.start();
}