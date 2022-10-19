let itemshop = require("../config/itemshop.json");

const GameMoney = require("./GameMoney.js");
const GameInventory = require("./GameInventory.js");
const GameCore = require("./GameCore.js");

ClientTrigger["itemshop.buy"] = (id,data) => {
    let player = MafiaUsers[id];
    if (player === undefined || player.died === true || !GameCore.isStart()) return;
    if (GameCore.isNight()) {
        player.ws.send("itemshop.notify",{content:"밤에는 구매할 수 없습니다."});
        return;
    }

    let itemcode = data.code;
    // client 에서 보낸 데이터는 신뢰하지 않기에 검사한다.
    if (typeof(itemcode) !== "string") return;

    // 팔지 않는 아이템
    if (itemshop[itemcode] === undefined) return;

    // 구매 직업제한
    if (itemshop[itemcode].limit !== undefined && itemshop[itemcode].limit !== player.job) {
        player.ws.send("itemshop.notify",{content:"구매 할 수 있는 직업이 아닙니다."});
        return;
    }

    // 돈이 충분하지 않음
    if (!GameMoney.tryPeyment(id,itemshop[itemcode].price)) {
        player.ws.send("itemshop.notify",{content:"돈이 충분하지 않습니다."});
        return;
    }

    GameInventory.giveInventory(id,itemcode,1);
    player.ws.send("itemshop.notify",{content:"성공적으로 구매하였습니다.",success:true});
}