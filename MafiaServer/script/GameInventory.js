const gameCore = require("./GameCore.js");
const skillManager = require("./SkillManager.js");

exports.giveInventory = (id,itemcode,amount) => {
    let user = MafiaUsers[id];
    if (user === undefined || amount <= 0 || !gameCore.isStart()) return;

    let inventory = MafiaUsers[id].inventory;

    if (inventory[itemcode] === undefined) {
        MafiaUsers[id].inventory[itemcode] = {
            amount: amount
        }
    } else {
        MafiaUsers[id].inventory[itemcode].amount += amount;
    }

    user.ws.send("inventory.update",{items:MafiaUsers[id].inventory});
}

exports.tryInventory = (id,itemcode,amount) => {
    let user = MafiaUsers[id];
    if (user === undefined) return;
    
    if (MafiaUsers[id].inventory[itemcode] === undefined) return false;

    let willAmount = MafiaUsers[id].inventory[itemcode].amount - amount;
    if (willAmount < 0) return false;

    MafiaUsers[id].inventory[itemcode].amount -= amount;
    
    if (willAmount === 0) {
        delete MafiaUsers[id].inventory[itemcode];
    }

    user.ws.send("inventory.update",{items:MafiaUsers[id].inventory});
    return true;
}

exports.getInventoryItemAmount = (id,itemcode) => {
    let user = MafiaUsers[id];
    if (user === undefined) return 0;
    
    let inventory = user.inventory;
    
    if (inventory[itemcode] === undefined) return 0;

    return inventory[itemcode].amount || 0;
}

ClientTrigger["inventory.use"] = (id,data) => {
    const player = MafiaUsers[id];
    let itemcode = data.item;
    if (!gameCore.isStart() || player === undefined || itemcode === undefined || player.died === true) return;

    if (!exports.tryInventory(id,itemcode,1)) {
        player.ws.send("mapNotify.add",{ title:"인벤토리 - 오류", content:"아이템이 부족합니다." });
        return;
    }

    let itemuseStatus = skillManager.use(id,itemcode);
    if (itemuseStatus !== true) {
        // 이미 아이템이 소모된 상태에서 사용을 실패하면 다시 아이템을 돌려준다.
        exports.giveInventory(id,itemcode,1);
        if (itemuseStatus === 1) {
            player.ws.send("mapNotify.add",{ title:"인벤토리 - 오류", content:"이미 사용중인 아이템 입니다." });
        }
        return;
    }

    console.log("[GameInventory] "+id+" / "+itemcode+" 스킬 사용");
}