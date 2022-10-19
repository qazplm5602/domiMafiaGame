const gameCore = require("./GameCore.js");
const UserManager = require("./UserManager.js");
const skillManager = require("./SkillManager.js");

let votePolice;
let voteEMS;
let voteMafia;

let voteCitizen;

class VoteObject {
    players = {};
    select = {};
}

exports.reset = () => {
    console.log("[GameVote] 초기화");
    voteEMS = voteCitizen = voteMafia = votePolice = undefined;
}

// 투표 세팅 (낮)
exports.InitMorningVote = () => {
    console.log("[GameVote] 투표를 세팅합니다. (낮)");

    let Users = UserManager.ObjectToArray();
    voteCitizen = new VoteObject();
    
    Users.forEach(player => {
        if (player.died === false) {
            voteCitizen.players[player.id] = {
                name: player.name,
                avatar: player.avatar
            }
            voteCitizen.select[player.id] = null;
        }
    });

    Users.forEach(player => {
        if (player.died === false) {
            player.ws.send("vote.Init",{
                title: "사형 할 플레이어를 선택하세요.",
                callback:"Citizen",
                players: voteCitizen.players,
                skips: Object.keys(voteCitizen.select).length
            });
        }
    });
}

// 투표 요청 (낮)
ClientTrigger["vote.SetCitizen"] = function(id,data) {
    if (voteCitizen === undefined || data.select === undefined || gameCore.isNight()) return;
    if (voteCitizen.select[id] === undefined) return;
    
    if (data.select === null) {
        voteCitizen.select[id] = null;
    } else {
        if (voteCitizen.players[data.select] === undefined) return;
    
        voteCitizen.select[id] = data.select;
    }

    console.log("[GameVote] "+id+" 투표설정(citizen) 값: "+String(data.select));
    UserManager.ObjectToArray().forEach(player => {
        if (player.died === false) {
            player.ws.send("vote.Update",{
                checks:Object.values(voteCitizen.select)
            });
        }
    });
}

// 투표 마감 (낮)
exports.FinishMorningVote = () => {
    console.log("[GameVote] 낮 투표를 마감합니다.");

    gameCore.allPlayerSend("vote.Close");

    let SelectPlayer = getFirstVote(voteCitizen);
    // 초기화
    exports.reset();

    console.log("[GameVote] 사형투표 마감결과: "+String(SelectPlayer));
    if (SelectPlayer === null) return; // 건너뛰기
    if (SelectPlayer === undefined) { // 투표 부결
        gameCore.allPlayerSend("gamemain.ChatElement",{
            content:`<div class="stiker">
                <img src="./assets/gameMain/chat/Vote_icon.svg">
                <span>사형투표가 <span style="color :#c82020; font-family: 'SpoqaHanSansNeo-Bold';">부결</span>되었습니다.</span>
            </div>`
        });
        return;
    }

    gameCore.playerKill(SelectPlayer);
    gameCore.allPlayerSend("gamemain.ChatElement",{
        content:`<div class="stiker">
            <img src="./assets/gameMain/chat/Vote2.svg">
            <span>${UserManager.getPlayerName(SelectPlayer)}님이 <span style="color :#c82020; font-family: 'SpoqaHanSansNeo-Bold';">처형</span>되었습니다.</span>
        </div>`
    });
}

// 투표 세팅(밤)
exports.InitNightVote = () => {
    console.log("[GameVote] 투표를 세팅합니다. (밤)");
    let Users = UserManager.ObjectToArray();

    // 마피아
    voteMafia = new VoteObject();
    
    Users.forEach(player => {
        if (player.job === "mafia" && player.died === false) {
            voteMafia.select[player.id] = null;
        } else if (player.died === false) {
            voteMafia.players[player.id] = {
                name: player.name,
                avatar: player.avatar
            }
        }
    });

    // 의사
    voteEMS = new VoteObject();
    Users.forEach(player => {
        if (player.died === false) {
            // 자가 치료도 가능하기 때문에 의사도 투표에 포함한다.
            voteEMS.players[player.id] = {
                name: player.name,
                avatar: player.avatar
            }

            // 의사는 선택 가능
            if (player.job === "doctor") {
                voteEMS.select[player.id] = null;
            }
        }
    });

    // 경찰
    votePolice = new VoteObject();
    
    Users.forEach(player => {
        if (player.job === "police" && player.died === false) {
            votePolice.select[player.id] = null;
        } else if (player.died === false) {
            votePolice.players[player.id] = {
                name: player.name,
                avatar: player.avatar
            }
        }
    });

    UserManager.AllSendByJob("police","vote.Init",{
        title: "조사 할 플레이어를 선택하세요.",
        callback:"Police",
        players: votePolice.players,
        skips: Object.keys(votePolice.select).length
    });

    UserManager.AllSendByJob("doctor","vote.Init",{
        title: "살릴 플레이어를 선택하세요.",
        callback:"EMS",
        players: voteEMS.players,
        skips: Object.keys(voteEMS.select).length
    });
    UserManager.AllSendByJob("mafia","vote.Init",{
        title: "사살 할 플레이어를 선택하세요.",
        callback:"Mafia",
        players: voteMafia.players,
        skips: Object.keys(voteMafia.select).length
    });
    console.log("[GameVote] "+"투표할 수 있는 모든플레이어에게 화면을 전송");
}

// 투표 요청(밤)
ClientTrigger["vote.SetMafia"] = function(id,data) {
    if (voteMafia === undefined || data.select === undefined || !gameCore.isNight()) return;
    if (voteMafia.select[id] === undefined) return;
    
    if (data.select === null) {
        voteMafia.select[id] = null;
    } else {
        if (voteMafia.players[data.select] === undefined) return;
    
        voteMafia.select[id] = data.select;
    }

    console.log("[GameVote] "+id+" 투표설정(mafia) 값: "+String(data.select));
    UserManager.AllSendByJob("mafia","vote.Update",{
        checks:Object.values(voteMafia.select)
    });
}

ClientTrigger["vote.SetEMS"] = function(id,data) {
    if (voteEMS === undefined || data.select === undefined || !gameCore.isNight()) return;
    if (voteEMS.select[id] === undefined) return;
    
    if (data.select === null) {
        voteEMS.select[id] = null;
    } else {
        if (voteEMS.players[data.select] === undefined) return;
    
        voteEMS.select[id] = data.select;
    }

    console.log("[GameVote] "+id+" 투표설정(doctor) 값: "+String(data.select));
    UserManager.AllSendByJob("doctor","vote.Update",{
        checks:Object.values(voteEMS.select)
    });
}

ClientTrigger["vote.SetPolice"] = function(id,data) {
    if (votePolice === undefined || data.select === undefined || !gameCore.isNight()) return;
    if (votePolice.select[id] === undefined) return;
    
    if (data.select === null) {
        votePolice.select[id] = null;
    } else {
        if (votePolice.players[data.select] === undefined) return;
    
        votePolice.select[id] = data.select;
    }

    console.log("[GameVote] "+id+" 투표설정(police) 값: "+String(data.select));
    UserManager.AllSendByJob("police","vote.Update",{
        checks:Object.values(votePolice.select)
    });
}

// 투표 마감(밤)
exports.FinishNightVote = () => {
    console.log("[GameVote] 밤 투표를 마감합니다.");

    gameCore.allPlayerSend("vote.Close");

    // 경찰 조사 확인
    let SearchPlayer = getFirstVote(votePolice);
    if (SearchPlayer === undefined) { // 부결
        UserManager.AllSendByJob("police","gamemain.ChatElement",{
            content:`<div class="stiker">
                <img src="./assets/gameMain/chat/police/searchIcon.svg">
                <span>경찰조사 투표가 <span style="color :#c82020; font-family: 'SpoqaHanSansNeo-Bold';">부결</span>되었습니다.</span>
            </div>`
        });
    } else if (SearchPlayer === null) { // 건너뛰기
    } else {
        let player = MafiaUsers[SearchPlayer];
        if (player !== undefined) {
            let isMafia = player.job === "mafia";
            let element = `<div class="stiker"><img src="./assets/gameMain/chat/police/searchIcon.svg"><span>경찰조사에 `;

            if (isMafia && !skillManager.isSkillActiveById(SearchPlayer,"hacking")) {
                element += `<span style="color :#00A500; font-family: 'SpoqaHanSansNeo-Bold';">성공</span>하였습니다!</span>`;
            } else {
                element += `<span style="color :#c82020; font-family: 'SpoqaHanSansNeo-Bold';">실패</span>하였습니다!</span>`;
            }
            element += "</div>";

            UserManager.AllSendByJob("police","gamemain.ChatElement",{
                content:element
            });
        }
    }
    skillManager.skillResetUse("hacking");

    console.log("[GameVote] 경찰투표 마감결과: "+String(SearchPlayer));

    // 의사 투표
    let revivePlayerId = getFirstVote(voteEMS);
    if (revivePlayerId === undefined) {
        UserManager.AllSendByJob("doctor","gamemain.ChatElement",{
            content:`<div class="stiker">
                <img src="./assets/gameMain/chat/ems/remigho-syringe.svg">
                <span>의사 투표가 <span style="color :#c82020; font-family: 'SpoqaHanSansNeo-Bold';">부결</span>되었습니다.</span>
            </div>`
        });
    }
    console.log("[GameVote] 의사투표 마감결과: "+String(revivePlayerId));

    // 마피아 투표
    let diedPlayerId = getFirstVote(voteMafia);
    if (diedPlayerId === undefined) {
        UserManager.AllSendByJob("mafia","gamemain.ChatElement",{
            content:`<div class="stiker">
                <img src="./assets/gameMain/chat/mafia/knife-with-blood.svg">
                <span>마피아 투표가 <span style="color :#c82020; font-family: 'SpoqaHanSansNeo-Bold';">부결</span>되었습니다.</span>
            </div>`
        });
    }
    console.log("[GameVote] 마피아투표 마감결과: "+String(diedPlayerId));

    if (typeof(diedPlayerId) === "string") { // 플레이어가 선택되어 있어야함.
        if (typeof(revivePlayerId) === "string" && revivePlayerId === diedPlayerId) { // 마피아가 죽이려고 하였지만 의사가 살림
            UserManager.AllSendByJob("doctor","gamemain.ChatElement",{
                content:`<div class="stiker">
                    <img src="./assets/gameMain/chat/ems/remigho-syringe.svg">
                    <span>플레이어 살리기를 <span style="color :#00A500; font-family: 'SpoqaHanSansNeo-Bold';">성공</span>하였습니다!</span>
                </div>`
            });

            let player = MafiaUsers[revivePlayerId];
            player.ws.send("gamemain.ChatElement",{
                content:`<div class="stiker">
                    <img src="./assets/gameMain/chat/ems/remigho-syringe.svg">
                    <span>당신은 의사가 살렸습니다.</span>
                </div>`
            });
            console.log("[GameVote] 마피아와 의사 선택한 플레이어가 동일함.");
        } else {
            // 스킬 사용중
            if (skillManager.isSkillActiveById(diedPlayerId,"copyplayer")) {
                skillManager.skillRemoveUseById(diedPlayerId,"copyplayer");
            } else {
                gameCore.playerKill(diedPlayerId);
                let diedPlayerName = (MafiaUsers[diedPlayerId] || {}).name;
                if (diedPlayerName !== undefined) {
                    gameCore.allPlayerSend("gamemain.ChatElement",{
                        content:`<div class="stiker">
                            <img src="./assets/gameMain/chat/mafia/knife-with-blood.svg">
                            <span>${diedPlayerName}님이 <span style="color :#c82020; font-family: 'SpoqaHanSansNeo-Bold';">살해</span>당하였습니다.</span>
                        </div>`
                    });
                }
                console.log("[GameVote] 마피아 사살로 "+diedPlayerId+" 사망.");
            }
        }
    }

    // 초기화
    exports.reset();
}

// 제일 많이 투표된 아이디
let getFirstVote = (votetable) => {
    if (Object.keys(votetable.select).length <= 0) return null; // 투표 할 사람이 없으면 건너뛰기

    let result = Object.values(votetable.select).reduce((accu, curr) => { 
        accu[curr] = (accu[curr] || 0)+1; // 객체에서 curr key값을 찾아 value값이 있으면 그 value에서 1을 더하고, 없다면 0을 할당하고 거기에 1을 더해준다. 
        return accu;
    }, {});

    let arrayResult = new Array();
    for (let key in result) {
        let amount = result[key];
        if (key === "null") key = null; // null 타입이 string으로 되는것을 방지.
        arrayResult.push([key,amount]);
    }

    arrayResult.sort((a,b) => {
        return  b[1] - a[1];
    });

    if (arrayResult[1] !== undefined && (arrayResult[0][1] === arrayResult[1][1])) { // 투표 부결
        return undefined;
    }

    return arrayResult[0][0];
}