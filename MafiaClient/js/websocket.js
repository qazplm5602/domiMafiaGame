let socket;
let CallBack = new Array();

function ServerLogin(token) {
    socket = new WebSocket('ws://localhost:3000',token);
    
    
    // 연결이 열리면
    // socket.addEventListener('open', function (event) {
    //     $("#intro-progress-text").text("서버연결 성공. 서버응답을 기다리는중...");
    //     // socket.send(JSON.stringify({hello:'Hello Server!'}));
    // });

    socket.oldsend = socket.send;
    socket.send = function(type,data) {
        data = data || {};
        data.type = type;
        socket.oldsend(JSON.stringify(data));
    }

    socket.onmessage = event => {
        let data = JSON.parse(event.data);
        
        if (typeof(CallBack[data.type]) !== "function") {
            console.error("callback Type을 찾을 수 없습니다 / "+data.type);
            return;
        }

        CallBack[data.type](data);
    }

    socket.onclose = (data) => {
        if (data.code === 1000 && data.reason !== "") {
            $('.disconnect-content').text(data.reason);
        } else if (data.code === 1006) {
            $('.disconnect-content').text("서버와 연결이 끊어졌습니다.");
        } else {
            $('.disconnect-content').text("예기치 않게 서버와 연결이 끊어졌습니다. (코드: "+data.code.toString()+")");
        }

        $("#disconnect-screen").fadeIn(300);
    }
}

CallBack["welcome.domiserver"] = function(data) {
    $("#intro-progress-text").text(data.name.toString()+"님 환영합니다! 서버 응답을 기다리는중...");
}