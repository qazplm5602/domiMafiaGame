const gameCore = require("./GameCore.js");
const UserManager = require("./UserManager.js");
const gameCommand = require("./gameCommand.js");
const skillManager = require("./SkillManager.js");
let blockwords = require("../config/blockwords.json");
// 정렬
blockwords.sort((a,b) => {
    return b.length - a.length;
});

ClientTrigger["gamemain.chatSend"] = function(id,data) {
    if (!gameCore.isStart()) return;
    const user = MafiaUsers[id];
    if (user === undefined || data.content === undefined || data.content === "") return;

    // 내용 첫번째 글자가 명령어
    if (data.content[0] === "/") {
        gameCommand(id,data.content);
        return;
    }

    // 금지어
    blockwords.forEach(blockword => {
        data.content = data.content.replace(new RegExp(blockword,"g"),"사랑해");
    });

    // 관전자
    if (user.died === true) {
        // 죽은 플레이어만 채팅내용을 보냅니다.
        UserManager.ObjectToArray().forEach(player => {
            if (player.died === true) {
                player.ws.send("gamemain.userChat",{
                    name: String(user.name)+" (관전자)",
                    died:true,
                    content: data.content
                });
            }
        });
        return;
    }

    if (gameCore.isNight()) {
        // 교신 방해
        if (skillManager.activeSkill("chatblock") !== undefined) return;

        if (user.job === "citizen" || user.job === "worker") return; // 시민은 안됨.

        // 채팅을 보낸 플레이어 직업과 같아야 채팅내용을 볼 수 있습니다.
        UserManager.ObjectToArray().forEach(player => {
            if (player.job === user.job) {
                player.ws.send("gamemain.userChat",{
                    id:user.id,
                    name: user.name,
                    night:true,
                    content: data.content
                });
            }
        });

        // 드론 스킬을 사용하는 플레이어 목록
        let dronSkillUsers = skillManager.activeSkills("chatpeep");
        if (user.job === "mafia" && dronSkillUsers.length > 0) {
            // 드론 스킬을 사용하는 플레이어들에게 채팅내용은 보내지만 이름은 익명으로 합니다.
            dronSkillUsers.forEach(playerId => {
                const player = MafiaUsers[playerId];
                if (player !== undefined) {
                    player.ws.send("gamemain.userChat",{
                        name: "알수없음(마피아)",
                        night:true,
                        content: data.content
                    });
                }
            });
        }
        return;
    } 

    // 전체 플레이어들에게 채팅내용을 보냅니다.
    gameCore.allPlayerSend("gamemain.userChat",{
        id : id,
        name: user.name,
        content: data.content
    });
}