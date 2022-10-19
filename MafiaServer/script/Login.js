const request = require("request");
let save_Tokens = new Array();

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

expressAPP.post("/login", (req,res) => {
    const id = req.body.id;
    const password = req.body.password;

    if (id === undefined || id === "") {
        res.json({error:"아이디를 입력하세요."});
        return;
    }

    if (password === undefined || password === "") {
        res.json({error:"비밀번호를 입력하세요."});
        return;
    }

    // if (true) {
    //     res.json({error:"내부 네트워크로 접속하세요."});
    //     return;
    // }

    const options = {
        uri: "https://domi.kr/bbs/api_login.php",
        qs:{
            user:id,
            password:password
        },
        json: true
    };

    request(options,function(err,response,body){
        if (err) {
            res.json({error:"서버 내부에 오류가 발생하였습니다."});
            return;
        }

        if (response.statusCode !== 200) {
            res.json({error:"서버 내부에 오류가 발생하였습니다. / "+response.statusCode});
            return;
        }

        if (body === undefined || body === "") {
            res.json({error:"서버 내부에 오류가 발생하였습니다. / server empty"});
            return;
        }

        if (body.error) {
            res.json({error:body.error});
            return;
        }

        if (typeof(body.ok) !== "string") {
            res.json({error:"서버 내부에 오류가 발생하였습니다. / server request"});
            return;
        }

        const token = makeid(100);

        save_Tokens[token] = {
            id:id,
            name:body.ok,
            time: new Date()
        }
        res.json({token:token,name:body.ok});
    })
});

exports.getTokenData = token => {
    if (token === undefined) return;

    let data = save_Tokens[token];
    if (data === undefined) return;

    const time = data.time;
    if ((new Date() - time) > 60 * 1000) { // 만료된 토큰
        delete save_Tokens[token]; // 삭제
        return;
    }

    delete save_Tokens[token]; // 삭제

    return data;
}