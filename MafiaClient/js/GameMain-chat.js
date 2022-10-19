$(function() {
    $(".gamemain-chat-input").keydown(function(e) {
        if (e.keyCode !== 13) return; // 엔터키가 아니면
        // 채팅 내용
        let content = $(".gamemain-chat-input").val();
        
        // 아무내용이 없으면 커서를 해제합니다.
        if (content === "") {
            $(':focus').blur();
            return;
        }

        // 채팅내용을 서버로 보냅니다.
        socket.send("gamemain.chatSend",{content:content});

        // 초기화
        /* 채팅내용을 보내면 다시 입력박스를 눌러야하는 번거로움으로 주석처리 */
        // $(':focus').blur();
        
        // 채팅 입력값 비우기
        $(".gamemain-chat-input").val("");        
    });
});

CallBack["gamemain.userChat"] = function(data) {
    let id = data.id;
    let name = data.name;
    let content = data.content;
    let night = data.night;
    let died = data.died;

    $(".gamemain-chat-list").append(`<div class="basic"><span class="${night == true ? "night" : ""} ${died == true ? "died" : ""}">${escapeHtml(name)}</span>${escapeHtml(content)}</div>`);
    $('.gamemain-chat-list').stop().animate({
        scrollTop: $('.gamemain-chat-list')[0].scrollHeight
    }, 400);

    if (id === undefined) return;

    // 채팅 말풍선
    let $chat = $("#gamemain-player-"+id).find(".gamemain-player-chatbox")
    if ($chat.length <= 0) {
        $("#gamemain-player-"+id).append(`<div class="gamemain-player-chatbox"><span>${escapeHtml(content)}</span></div>`);
    } else {
        clearTimeout($chat.data("time"));
        $chat.attr("style","").html(`<span>${escapeHtml(content)}</span>`);
    }

    $("#gamemain-player-"+id).find(".gamemain-player-chatbox").stop().animate({
        top: 0,
        opacity: 1
    },250,'swing', function() {
        $(this).data("time",setTimeout(() => {
            $(this).remove();
        }, 5000));
    });

    // 사운드
    let effect = new Audio("../assets/gameMain/chat/chatttt.mp3");
    effect.volume = 0.1;
    effect.play();
}

CallBack["gamemain.ChatElement"] = function(data) {
    let content = data.content;
    $(".gamemain-chat-list").append(content);
    $('.gamemain-chat-list').stop().animate({
        scrollTop: $('.gamemain-chat-list')[0].scrollHeight
    }, 400);
}