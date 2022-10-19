const gameCore = require("./GameCore.js");
const GameInventory = require("./GameInventory.js");
const gameTime = require("./GameTime.js");
const GameVote = require("./GameVote.js");
const GameMoney = require("./GameMoney.js");

// 함수들
let skillfunction = {};
exports.skillFunction = skillfunction;

skillfunction["chicken"] = (id) => {
    const player = MafiaUsers[id];
    if (player === undefined) return;

    player.ws.send("mapNotify.add",{title:"domi - DEBUG",content:"옴뇸뇸"});
}

skillfunction["deahocity"] = id => {
    const player = MafiaUsers[id];
    if (player === undefined) return;

    gameCore.allPlayerSend("itemfunction.deaho");
}

skillfunction["timeReduction"] = id => {
    const player = MafiaUsers[id];
    if (player === undefined) return;

    if (gameCore.isNight()) {
        GameInventory.giveInventory(id,"timeReduction",1);
        player.ws.send("mapNotify.add",{title:"아이템 - 오류",content:"밤에는 불가능 합니다."});
        return;
    }
    if (gameTime.getTime() < 65) {
        GameInventory.giveInventory(id,"timeReduction",1);
        player.ws.send("mapNotify.add",{title:"아이템 - 오류",content:"65초 이상만 가능합니다."});
        return;
    }

    // 사형투표
    GameVote.InitMorningVote();
    // 30초 설정
    gameTime.setTime(30,true);

    gameCore.allPlayerSend("gamemain.ChatElement",{
        content:`<div class="stiker">
            <img src="./assets/items/timeReduction.png">
            <span>누군가에 의해 <span style="color :#c82020; font-family: 'SpoqaHanSansNeo-Bold';">시간단축</span>되었습니다.</span>
        </div>`
    });
}

skillfunction["casino"] = id => {
    const player = MafiaUsers[id];
    if (player === undefined) return;

    if (player.money <= 0) {
        player.ws.send("mapNotify.add",{title:"아이템 - 오류",content:"0원 이하는 불가능합니다."});
        return;
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        let rannum = Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함

        return rannum;
    }


    let randomNumber = Math.floor(player.money * Math.random());
    if (getRandomInt(1,4) > 1) {
        if (!GameMoney.tryPeyment(id,randomNumber)) GameMoney.setMoney(id,0);
        player.ws.send("mapNotify.add",{title:"도박 - 실패",content:"돈을 잃었습니다."});
    } else {
        GameMoney.giveMoney(id,randomNumber);
        player.ws.send("mapNotify.add",{title:"도박 - 성공",content:"돈을 얻었습니다."});
    }
}

// 트리거들
let skillTrigger = {};
exports.skillTrigger = skillTrigger;

skillTrigger["chatblock"] = () => {
    if (!gameCore.isNight()) return;

    gameCore.allPlayerSend("gamemain.ChatElement",{
        content:`<div class="stiker">
            <img src="./assets/items/chatblock.png">
            <span>누군가에 의해 <span style="color :#c82020; font-family: 'SpoqaHanSansNeo-Bold';">채팅</span>이 불가합니다.</span>
        </div>`
    });
}

skillTrigger["hacking"] = id => {
    const player = MafiaUsers[id];
    if (player === undefined) return;
    
    player.ws.send("mapNotify.add",{title:"스킬 - 해킹",content:"해킹 스킬을 사용하였습니다. 경찰이 조사 할 경우 마피아 여부가 변경됩니다."});
}

skillTrigger["copyplayer"] = id => {
    const player = MafiaUsers[id];
    if (player === undefined) return;
    
    player.ws.send("mapNotify.add",{title:"스킬 - 똑같지만 다른 나",content:"스킬을 사용하였습니다. 마피아가 사살 시 다시 부활합니다."});
}