const gameCore = require("./GameCore.js");

let timer = 0;
let timeloop;
let timeReservation;

exports.isPause = () => {
    return timeloop === undefined;
}

exports.getTime = () => {
    return timer;
}

exports.resetTime = () => {
    console.log("[GameTime] 시간 초기화");
    if (timeloop !== undefined) clearInterval(timeloop);
    timeloop = timeReservation = undefined;
    timer = 0;
}

exports.setTime = (time,NotremoveReservation) => {
    if (time < 0) return;

    timer = time;
    if (!NotremoveReservation) timeReservation = {};
    if (timeloop === undefined) {
        timeloop = setInterval(() => {
            timer --;
            gameCore.allPlayerSend("timer.setText",{time:timer});
            
            // 예약된 시간
            for (const key in timeReservation) {
                const element = timeReservation[key];
                if (element[0] === timer && gameCore.isNight() === element[1]) {
                    element[2]();
                    if (timeReservation !== undefined)
                        delete timeReservation[key];
                }
            }

            if (timeloop === undefined) { // 예약된 코드가 작동후 시간이 멈추었다면.
                clearInterval(this);
                return;
            }

            if (timer <= 0) {
                clearInterval(timeloop);
                timeloop = undefined;

                if (gameCore.isNight()) {
                    // morning 트리거
                    gameCore.morningTrigger();
                } else {
                    // night 트리거
                    gameCore.nightTrigger();
                }
            }
        },1000);
    }
}

exports.setReserve = (time,night,callback) => {
    if (timeReservation === undefined) return;
    
    const id = Object.keys(timeReservation).length + 1;
    timeReservation[id] = [time,night,callback];
}