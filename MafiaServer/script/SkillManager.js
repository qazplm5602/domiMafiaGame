const gameCore = require("./GameCore.js");
const { skillFunction, skillTrigger } = require("./Skillfunction.js");

let skillUseList = {};

exports.reset = () => {
    console.log("[SkillManager] 초기화");
    skillUseList = {};
}

exports.use = (id,itemcode) => {
    // 함수가 있으면 밑에 코드는 실행시키지 않고 함수를 실행한다.
    if (typeof(skillFunction[itemcode]) === "function") {
        skillFunction[itemcode](id);
        return true; // 처리 성공
    }

    if (skillUseList[itemcode] === undefined) skillUseList[itemcode] = new Array();

    // 배열 안에 id가 있는지 확인하고 있다면 이미 사용중이기 때문에 오류코드를 반환한다.
    if (skillUseList[itemcode].find(element => element === id) !== undefined) {
        return 1; // 오류코드 반환
    }

    // 배열에 플레이어 ID를 추가한다.
    skillUseList[itemcode].push(id);

    // 함수가 있으면 실행한다.
    if (typeof(skillTrigger[itemcode]) === "function") {
        skillTrigger[itemcode](id);
    }

    return true; // 처리 성공
}

exports.activeSkill = (item) => {
    const useUsers = skillUseList[item];
    if (useUsers === undefined || useUsers[0] === undefined) return;
    return useUsers[0];
}

exports.activeSkills = (item) => (skillUseList[item] || {});

exports.isSkillActiveById = (id,item) => {
    const useUsers = skillUseList[item];
    if (useUsers === undefined) return false;

    return useUsers.find(useId => useId === id) !== undefined;
}

exports.skillRemoveUseById = (id,item) => {
    const useUsers = skillUseList[item];
    if (useUsers === undefined) return;
    
    let index = useUsers.indexOf(id);
    if (index < 0) return;

    skillUseList[item].splice(index,1);
}

exports.skillRemoveUse = (item) => {
    if (skillUseList[item] === undefined || skillUseList[item][0] === undefined) return;
    if (skillUseList[item].length <= 1) { // 1 이하
        delete skillUseList[item]; // 삭제
    } else {
        skillUseList[item].splice(0,1); // 배열삭제
    }
}

exports.skillRemoveAllUseById = id => {
    for (const key in skillUseList) {
        exports.skillRemoveUseById(id,key);
    }
}

exports.skillResetUse = (item) => {
    delete skillUseList[item];
}

exports.morningEvent = () => {
    console.log("[skillManager] 아침 이벤트");
    exports.skillRemoveUse("chatblock"); // 교신방해 소모
    exports.skillResetUse("chatpeep"); // 드론사용 모두 초기화
}

exports.nightEvent = () => {
    console.log("[skillManager] 밤 이벤트");
    if (exports.activeSkill("chatblock") !== undefined) {
        gameCore.allPlayerSend("gamemain.ChatElement",{
            content:`<div class="stiker">
                <img src="./assets/items/chatblock.png">
                <span>누군가에 의해 <span style="color :#c82020; font-family: 'SpoqaHanSansNeo-Bold';">채팅</span>이 불가합니다.</span>
            </div>`
        });
    }
}