let LobbyChat = new Array();
LobbyChat.hideTime;

LobbyChat.add = (name,content,color) => {
    let nameElement = "";
    if (typeof(name) === "string") {
        nameElement = `<span style="${color ? "color:"+color+";" : ""}">${escapeHtml(name)}</span>: `;
    }

    $(".lobby-chat-content").append(`
        <div style="${color ? "color:"+color+";" : ""}">${nameElement}${escapeHtml(content)}</div>
    `);
    $(".lobby-chat-content").stop().fadeIn(200);
    $('.lobby-chat-content').animate({
        scrollTop: $('.lobby-chat-content')[0].scrollHeight
    }, 400);

    if (LobbyChat.hideTime) {
        clearTimeout(LobbyChat.hideTime);
    }

    LobbyChat.hideTime = setTimeout(() => {
        $(".lobby-chat-content").stop().fadeOut(1000);
    }, 5000);
}

CallBack["lobby.UserChat"] = function(data) {
    LobbyChat.add(data.name,data.content);
}

CallBack["lobby.SystemChat"] = function(data) {
    LobbyChat.add("System",data.content,"rgb(255,50,50)");
}

$(function() {
    $(".lobby-chat-input").keydown(function(e) {
        if (e.keyCode !== 13) return;
        let content = $(".lobby-chat-input").val();
        
        if (content === "") {
            $(':focus').blur();
            return;
        }

        socket.send("lobby.chatSend",{content:content});

        // 초기화
        $(':focus').blur();
        $(".lobby-chat-input").val("");        
    });
})