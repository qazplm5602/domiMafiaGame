exports.AllPlayersNum = () => {
    return Object.keys(MafiaUsers).length;
}

exports.AllPlayerReady = () => {
    let ready = true;
    for (const key in MafiaUsers) {
        const element = MafiaUsers[key];
        if (element.LobbyReady == false) {
            ready = false;
            return false;
        }
    }

    return ready;
}

exports.ObjectToArray = () => {
    let tb = new Array();
    
    for (const key in MafiaUsers) {
        let element = MafiaUsers[key];
        element.id = key;
        tb.push(element);
    }

    return tb;
}

exports.AllSendByJob = (job,type,data) => {
    exports.ObjectToArray().forEach(player => {
        if (player.job === job && player.died === false) {
            player.ws.send(type,data);
        }
    });
}

exports.getPlayerName = id => {
    let player = MafiaUsers[id];
    let name = "Unknown";

    if (player !== undefined && typeof(player.name) === "string") {
        name = player.name;
    }
    
    return name;
}