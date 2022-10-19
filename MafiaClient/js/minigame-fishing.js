let MinigameFish = new Array();
MinigameFish.waitDelay;
MinigameFish.barLoop;
MinigameFish.keyList;
MinigameFish.keyLoop;

MinigameFish.bar_toggle = ok => {
    if (ok) {
        $('#minigame-fish-space').addClass('domiparmotion');
        $('#minigame-fish-space').fadeIn(200);
    } else {
        $('#minigame-fish-space').fadeOut(200);
        $('#minigame-fish-space').addClass('domiparmotioncut');
        setTimeout(() => {
            $('#minigame-fish-space').removeClass('domiparmotioncut').removeClass('domiparmotion');
        }, 210);
    }
}

MinigameFish.key_toggle = ok => {
    if (ok) {
        $('#minigame-fish-key_main').addClass('domishow');
        $('#minigame-fish-key_main').fadeIn(200);
    } else {
        $('#minigame-fish-key_main').fadeOut(200);
        $('#minigame-fish-key_main').addClass('domicut');
        setTimeout(() => {
            $('#minigame-fish-key_main').removeClass('domicut').removeClass('domishow');
            for (let i=1; i <= 6 ; i++) {
                $('#minigame-fish-key-'+i).css('color','white');
            }
        }, 210);
    }
}

MinigameFish.key_check = (id,win) => {
    if (win) { // 이김
        $('#minigame-fish-key-'+id).css('color','#0BC904');
        $('#minigame-fish-2_key-'+id).css('opacity',1).delay(40).animate({
            'font-size':'18px',
            // 'line-height':'65px',
            opacity:0
        }, 250);
        setTimeout(() => {
            $('#minigame-fish-2_key-'+id).css('font-size','35px');
        }, 310);
    } else { // 짐
        $('#minigame-fish-key-'+id).css('color','#DB0000');
    }
}

MinigameFish.kbd_toggle = ok => {
    if (ok) {
        $('#minigame-fish-wait_fish').css('opacity',1).css('transform','translate(-50%,-50%) scale(1)');
    } else {
        $('#minigame-fish-wait_fish').css('opacity',0).css('transform','translate(-50%,-50%) scale(1.2)');
    }
}

// 초기화
MinigameFish.Reset = () => {
    if (MinigameFish.waitDelay !== undefined) {
        clearTimeout(MinigameFish.waitDelay);
        MinigameFish.waitDelay = undefined;
    }
    if (MinigameFish.barLoop !== undefined) {
        clearInterval(MinigameFish.barLoop);
        MinigameFish.barLoop = undefined;
    }
    MinigameFish.keyList = undefined;
    if (MinigameFish.keyLoop !== undefined) {
        clearInterval(MinigameFish.keyLoop);
        MinigameFish.keyLoop = undefined;
    }

    MinigameFish.bar_toggle(false);
    MinigameFish.key_toggle(false);
    MinigameFish.kbd_toggle(false);

    $("#minigame-fish").hide();
}


MinigameFish.start = () => {
    $("#minigame-fish").show();
    setTimeout(() => {
        MinigameFish.kbd_toggle(true);
    }, 100);

    MinigameFish.waitDelay = setTimeout(() => {
        MinigameFish.waitDelay = undefined;
        MinigameFish.kbd_toggle(false);
        MinigameFish.bar_toggle(true);

        if (MinigameFish.barLoop !== undefined) clearInterval(MinigameFish.barLoop);

        let speed = 0.3
        let now_line = 0
        let isUP = true

        MinigameFish.barLoop = setInterval(() => {
            if (isUP) {
                now_line += speed;
                speed += 0.02;
                if (now_line >= 100) {
                    isUP = false;
                }
                
            } else {
                now_line -= speed;
                if (speed > 0.3) {
                    speed -= 0.02
                }
                if (now_line <= 0) {
                    isUP = true
                    speed = 0.3
                }
            }

            $(".minigame-fish-innerdiv").css("height",now_line+"%");
        },10);

    }, 1000 * getRandomInt(3,10));
}

// BAR 키보드
KeyManager.push(keycode => {
    if (MinigameFish.barLoop === undefined) return;
    // 취소
    if (keycode === 8) {
        MinigameFish.Reset();
        workNPC.Reset();
        return;
    }
    if (keycode !== 32) return;

    clearInterval(MinigameFish.barLoop);
    MinigameFish.barLoop = undefined;
    let height_pct = Math.round( 
        $('.minigame-fish-innerdiv').height() / 
        $('.minigame-fish-innerdiv').parent().height() * 100
    );
    
    // 실패
    if (height_pct < 85) {
        setTimeout(() => {
            MinigameFish.bar_toggle(false);
            setTimeout(() => {
                MinigameFish.Reset();
            },200);
        }, 500);
        workNPC.Reset();
        return;
    }

    // 성공 진행..
    let keyboardList = ["W","A","S","D"];
    MinigameFish.keyList = new Array(); // 초기화
    
    let forcounts = 6;
    if (getRandomInt(1,4) > 2) {
        forcounts = getRandomInt(3,6);
    }
    for (let i=1; i <= forcounts; i++) {
        let keyString = keyboardList[getRandomInt(0,keyboardList.length)];
        var keycode = 0;
        switch (keyString) {
            case "W":
                keycode = 87;
                break;
            case "A":
                keycode = 65;
                break;
            case "S":
                keycode = 83;
                break;
            case "D":
                keycode = 68;
                break;
        }
        MinigameFish.keyList.push([keyString,keycode,false]);
    }

    // 키표시 초기화
    for (let i=1; i <= 6; i++) {
        $("#minigame-fish-key-"+i).text("");
        $("#minigame-fish-2_key-"+i).text("");
    }
    $(".minigame-fish-time_bar").css("width","100%");

    // 적용
    let loop = 0;
    MinigameFish.keyList.forEach(keyString => {
        loop ++;
        $("#minigame-fish-key-"+loop).text(keyString[0]);
        $("#minigame-fish-2_key-"+loop).text(keyString[0]);
    });

    workNPC.Setmessage("빠르게 보고 키를 눌러구리.");

    MinigameFish.bar_toggle(false);
    MinigameFish.key_toggle(true);

    if (MinigameFish.keyLoop !== undefined) {
        clearInterval(MinigameFish.keyLoop);
        MinigameFish.keyLoop = undefined;
    }

    let timeout = 100;
    MinigameFish.keyLoop = setInterval(() => {
        timeout -= 0.6;
        $(".minigame-fish-time_bar").css("width",timeout+"%");

        if (timeout <= 0) { // 실패 - 타임아웃
            clearInterval(MinigameFish.keyLoop);
            MinigameFish.keyLoop = undefined;
            MinigameFish.keyList = undefined;

            setTimeout(() => {
                MinigameFish.key_toggle(false);
                setTimeout(() => {
                    MinigameFish.Reset();
                },200);
            }, 500);
            workNPC.Reset();
        }
    },10);
});

// 키보드 확인
KeyManager.push(keycode => {
    if (MinigameFish.keyLoop === undefined || MinigameFish.keyList === undefined || keycode === 32) return;

    let keynum = 0;
    let number = 0;
    let find = false;
    // 진행중인 아이디 찾기
    MinigameFish.keyList.forEach(data => {
        if (find == true) return;
        number ++;
        if (data[2] === false) {
            keynum = data[1];
            find = true
            return false;
        }
    });

    // 실패
    if (keynum !== keycode) {
        if (MinigameFish.keyLoop !== undefined) {
            clearInterval(MinigameFish.keyLoop);
            MinigameFish.keyLoop = undefined;
        }
        MinigameFish.keyList = undefined;

        MinigameFish.key_check(number,false);
        // 오디오 재생
        let PressAudio = new Audio("../assets/minigame/fish/keypressFail.mp3");
        PressAudio.volume = 0.3;
        PressAudio.play();

        setTimeout(() => {
            MinigameFish.key_toggle(false);
            setTimeout(() => {
                MinigameFish.Reset();
            },200);
        }, 500);
        workNPC.Reset();
        return;
    }

    MinigameFish.keyList[number - 1][2] = true;
    MinigameFish.key_check(number,true);
    // 오디오 재생
    let PressAudio = new Audio("../assets/minigame/fish/keypress.mp3");
    PressAudio.volume = 0.3;
    PressAudio.play();

    // 성공 - 끝
    if (MinigameFish.keyList.length === number) {
        if (MinigameFish.keyLoop !== undefined) {
            clearInterval(MinigameFish.keyLoop);
            MinigameFish.keyLoop = undefined;
        }
        MinigameFish.keyList = undefined;
        setTimeout(() => {
            MinigameFish.key_toggle(false);
            setTimeout(() => {
                MinigameFish.Reset();
            },200);
        }, 500);
        workNPC.Reset();

        console.log("minigame Fishing clear!");

        // 낚시 성공 이벤트 코드 추가예정
    }
});

// 대기 취소
KeyManager.push(keycode => {
    if(MinigameFish.waitDelay === undefined || keycode !== 8) return;
    clearTimeout(MinigameFish.waitDelay);
    MinigameFish.waitDelay = undefined;

    MinigameFish.kbd_toggle(false);
    setTimeout(() => {
        MinigameFish.Reset();
    },200);
    workNPC.Reset();
});