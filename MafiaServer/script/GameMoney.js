exports.giveMoney = (id,value) => {
    let player = MafiaUsers[id];
    if (player === undefined || player.died === true || value <= 0) return;

    MafiaUsers[id].money += value;
    player.ws.send("gamemain.moneyChange",{ value: MafiaUsers[id].money });
}

exports.tryPeyment = (id,value) => {
    let player = MafiaUsers[id];
    if (player === undefined || player.died === true) return false;

    let willValue = MafiaUsers[id].money - value;

    // 돈이 충분하지 않음.
    if (willValue < 0) return false;

    MafiaUsers[id].money -= value;

    player.ws.send("gamemain.moneyChange",{ value: MafiaUsers[id].money });
    return true;
}

exports.setMoney = (id,value) => {
    let player = MafiaUsers[id];
    if (player === undefined || player.died === true || value < 0) return;

    MafiaUsers[id].money = value;
    player.ws.send("gamemain.moneyChange",{ value: MafiaUsers[id].money });
}