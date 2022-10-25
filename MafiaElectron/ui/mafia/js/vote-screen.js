let voteScreen = new Array();
voteScreen.callback;

voteScreen.init = function(title,callbackname,players,skips) {
    voteScreen.callback = callbackname;
    $(".vote-title").text(title);

    $(".vote-list").empty();
    $(".vote-skips").empty();
    $.each(players, function(id,data) {
        $(".vote-list").append(`
        <div class="vote-player" id="vote-player-${id}" data-id="${id}">
            <div class="vote-player-name">${escapeHtml(data.name)}</div>
            <section>
                <img class="vote-player-avatar" src="${data.avatar}">
                <div class="vote-player-checks">
                </div>
            </section>
        </div>
        `);
    });
    
    for (let i=1; i <= skips; i++) {
        $(".vote-skips").append("<div></div>");
    }

    $("#vote-main").removeClass("hide").show();
}

voteScreen.toggle = function() {
    if ($("#vote-main").hasClass("hide")) {
        $("#vote-main").removeClass("hide");
    } else {
        $("#vote-main").addClass("hide");
    }
}

CallBack["vote.Init"] = function(data) {
    voteScreen.init(data.title,data.callback,data.players,data.skips);
}

CallBack["vote.Update"] = function(data) {
    $(".vote-player-checks").empty();
    $(".vote-skips").empty();

    data.checks.forEach(id => {
        if (id === null) {
            $(".vote-skips").append("<div></div>");
        } else {
            $("#vote-player-"+id).find(".vote-player-checks").append("<div></div>");
        }
    });
}

CallBack["vote.Close"] = function() {
    voteScreen.callback = undefined;
    $(".vote-title").text("empty message");

    $(".vote-list").empty();
    $(".vote-skips").empty();
    $("#vote-main").removeClass("hide").hide();
}

$(function() {
    $(document).on("click",".vote-player", function() {
        if (voteScreen.callback === undefined) return;
        let id = $(this).data("id");
        if (id === undefined) return;

        $(".vote-player.check").removeClass("check");
        $(this).addClass("check");

        socket.send("vote.Set"+voteScreen.callback,{select:id});
    });

    $(".vote-skip-button").click(function() {
        if (voteScreen.callback === undefined) return;
        $(".vote-player.check").removeClass("check");

        socket.send("vote.Set"+voteScreen.callback,{select:null});
    });
});