const UserManager = require("./UserManager.js");
const GameTime = require("./GameTime.js");
const GameVote = require("./GameVote.js");
const skillManager = require("./SkillManager.js");

let GameStart = false;
let TimeNight = false;
let Uptime = 0;

exports.isStart = () => {
    return GameStart;
}

exports.isNight = () => {
    return TimeNight;
}

// 모든 플레이어에게 send
exports.allPlayerSend = (type,data) => {
    for (const key in MafiaUsers) {
        const element = MafiaUsers[key];
        element.ws.send(type,data);
    }
}

// 플레이어 사망
exports.playerKill = id => {
    let player = MafiaUsers[id];
    if (player === undefined) return;

    player.died = true; // 사망 처리
    skillManager.skillRemoveAllUseById(id); // 사용중인 스킬 삭제
    exports.allPlayerSend("gamemain.playerdied",{id:id});
    player.ws.send("deathNotify.show");
}

// 게임이 종료될수 있는 조건 확인
exports.gameIfStop = () => {
    let countMafia = 0;
    let countCitizen = 0;
    
    UserManager.ObjectToArray().forEach(player => {
        if (player.died === false) {
            if (player.job === "mafia") { // 마피아
                countMafia ++;
            } else { // 시민
                countCitizen ++;
            }
        }
    });

    if (countCitizen > countMafia && countMafia > 0) return;
    
    let SaveUpTime = new Date() - Uptime;
    exports.gameStop();
    
    let mafiaWin = false;
    if (countCitizen <= countMafia) mafiaWin = true; // 마피아 승리

    exports.allPlayerSend("gameresult.init",{
        mafia:mafiaWin,
        time:SaveUpTime
    });

    return true;
}

// 게임 종료
exports.gameStop = () => {
    console.log("[GameCore] 게임을 종료합니다.");
    GameTime.resetTime();
    GameVote.reset();
    skillManager.reset();
    GameStart = false;
    TimeNight = false;
    Uptime = 0;
}

// 플레이어 초기화
const AllPlayerReset = () => {
    let MafiaPlayer = require("./MafiaPlayer.js");

    // for문을 돌려 모든 플레이어를  ws,name 을 제외한 모두 초기화 합니다.
    for (const key in MafiaUsers) {
        const element = MafiaUsers[key];
        MafiaUsers[key] = new MafiaPlayer(element.ws,element.name);
    }
}

// 랜덤으로 직업 정하기
const AllPlayerRandomJob = () => {
    // 모든 유저수
    let allUsers = UserManager.AllPlayersNum();
    // 모든유저수 나누기 5를 하여 특수직업을 각자 뽑는 수
    let jobMax = Math.floor(allUsers / 5);

    let alreadyUsers = new Array();
    // 최소값과 최대값 안에서 랜덤으로 숫자를 반환합니다.
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        let rannum = Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
        
        // alreadyUsers 배열에 이미 같은 숫자가 있다면 똑같은 함수를 실행시킵니다.
        if (alreadyUsers.find(element => element === rannum) !== undefined) {
          return getRandomInt(min, max);
        }
        
        return rannum;
    }

    // 마피아 지정
    for (let i = 1; i <= jobMax; i++) {
        let randnum = getRandomInt(0,allUsers);
        alreadyUsers.push(randnum);
      
        let user = MafiaUsers[Object.keys(MafiaUsers)[randnum]];
        user.job = "mafia";
    }
    
    // 경찰 지정
    for (let i = 1; i <= jobMax; i++) {
        let randnum = getRandomInt(0,allUsers);
        alreadyUsers.push(randnum);
      
        let user = MafiaUsers[Object.keys(MafiaUsers)[randnum]];
        user.job = "police";
    }
    
    // 의사 지정
    for (let i = 1; i <= jobMax; i++) {
        let randnum = getRandomInt(0,allUsers);
        alreadyUsers.push(randnum);
      
        let user = MafiaUsers[Object.keys(MafiaUsers)[randnum]];
        user.job = "doctor";
    }

    // 노동자 (1명만)
    let workerNum = getRandomInt(0,allUsers);
    alreadyUsers.push(workerNum);
    MafiaUsers[Object.keys(MafiaUsers)[workerNum]].job = "worker";
}

// 모든 플레이어 init
const AllPlayerGameInit = () => {
    // 객체에서 배열로 변경합니다.
    let Users = UserManager.ObjectToArray();

    let Users_info = new Array();
    // 필요한 데이터만 보내기 위해 id,name 만 추가합니다.
    Users.forEach(user => {
        Users_info.push({
            id:user.id,
            name:user.name
        });
    });


    Users.forEach(user => {
        user.ws.send("gamemain.init",{job:user.job,myid:user.id,players:Users_info});
    });
}

// 관전자 init
exports.spectatorScreenInit = (id) => {
    const user = MafiaUsers[id];
    if (user === undefined) return;

    let Users = UserManager.ObjectToArray();

    let Users_info = new Array();

    Users.forEach(user => {
        if (user.died === false) {
            Users_info.push({
                id:user.id,
                name:user.name
            });
        }
    });

    user.ws.send("gamemain.init",{players:Users_info,spectator:true});
    user.ws.send("gamemain.ChatElement",{content:`<span style="color:red; margin:5px auto; font-size: 12px;">당신은 중간 참여했기에 관전자입니다.</span>`});
}

// 직업 카운트 (로그)
exports.LogJobLength = () => {
    let Jobs = {};
    UserManager.ObjectToArray().forEach(player => {
        let count = Jobs[player.job] || 0;
        Jobs[player.job] = count + 1;
    });

    for (const key in Jobs) {
        let count = Jobs[key];
        console.log("[GameCore] 직업 로그 "+key+" / "+count);
    }
}

// 게임 시작
exports.GameStart = () => {
    // 이미 게임이 시작중이면 리턴하여 아래 코드는 실행하지 않도록 합니다.
    if (GameStart) return;

    console.log("[GameCore] 게임을 시작합니다.");
    GameStart = true;
    TimeNight = false;
    Uptime = new Date(); // 게임을 시작한 시간 저장
    // 모두에게 곧 게임을 시작한다는 화면을 띄웁니다.
    exports.allPlayerSend("lobby.gameReady");
    
    console.log("[GameCore] 플레이어 초기화");
    AllPlayerReset();
    
    console.log("[GameCore] 랜덤으로 직업을 지정합니다.");
    AllPlayerRandomJob();

    // 콘솔에 각자 직업별 인원수를 띄웁니다.
    exports.LogJobLength();

    // 13초 뒤 시작
    setTimeout(() => {
        console.log("[GameCore] 모두에게 게임화면을 init 합니다.");
        AllPlayerGameInit();

        console.log("[GameCore] 시간을 설정합니다.");
        GameTime.setTime(600);
    }, 1000 * 13);
}

// 밤 이벤트
exports.nightTrigger = () => {
    console.log("[GameCore] 밤으로 설정합니다.");
    TimeNight = true; // 밤으로 설정

    exports.allPlayerSend("gamemain.ChatElement",{content:`<span style="color:red; margin:5px auto; font-size: 12px;">밤이 되었습니다. 같은 직업끼리만 가능합니다.</span>`});
    exports.allPlayerSend("gamemain.ChangeNight");

    // 시간 흐르기
    console.log("[GameCore] 시간을 설정합니다. 120초");
    GameTime.setTime(30); // test

    skillManager.nightEvent();

    // 투표를 설정합니다.
    console.log("[GameCore] 밤 투표를 시작합니다.");
    GameVote.InitNightVote();
}

// 낮 이벤트
exports.morningTrigger = () => {
    console.log("[GameCore] 아침으로 설정합니다.");
    TimeNight = false; // 낮으로 설정
    
    GameVote.FinishNightVote();

    // 이 함수가 실행 된 후 마피아가 전멸하거나 시민보다 마피아 수가 더 클 경우 게임을 종료합니다.
    if (exports.gameIfStop()) return;

    exports.allPlayerSend("gamemain.ChangeMorning");
    exports.allPlayerSend("gamemain.ChatElement",{content:`<span style="color:red; margin:5px auto; font-size: 12px;">날이 밝았습니다.</span>`});
    
    // 시간 흐르기
    console.log("[GameCore] 시간을 설정합니다. 120초");
    GameTime.setTime(120); // test

    skillManager.morningEvent();

    GameTime.setReserve(60,false,() => {
        GameVote.InitMorningVote();
    });

    GameTime.setReserve(20,false,() => {
        GameVote.FinishMorningVote();
        if (exports.gameIfStop()) return;

        // 이 밑의 코드를 실행 하기 전 게임이 끝날 조건이 되는지 확인.
    });
}