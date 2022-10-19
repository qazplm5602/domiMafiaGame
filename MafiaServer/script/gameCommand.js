let commandFunctions = {};

module.exports = (id,content) => {
    const args = content.split(' ');
    const mode = args[0].substr(1);
  
    let functions = commandFunctions[mode];
    if (typeof(functions) !== "function") {
      let player = MafiaUsers[id];
      if (player === undefined) return;
      player.ws.send("gamemain.ChatElement",{content:`<span style="color:red; margin:5px auto; font-size: 12px;">알수없는 명령어 입니다. /help 로 도움말을 확인하세요.</span>`});
      return;
    }
    
    commandFunctions[mode](id,...(args.slice(1)));
}

commandFunctions.help = function(id) {
    let player = MafiaUsers[id];
    if (player === undefined) return;
    
    player.ws.send("gamemain.ChatElement",{content:`<span style="color:red; margin:5px auto; font-size: 12px;">어쩔팁비</span>`});
}

commandFunctions.givemoney = function(id,value) {
  let player = MafiaUsers[id];
  if (player === undefined) return;
  
  value = Number(value);
  
  if (isNaN(value) || value <= 0) {
    player.ws.send("gamemain.ChatElement",{content:`<span style="color:red; margin:5px auto; font-size: 12px;">손님 맞을래요?</span>`});
    return;
  }

  const gameMoney = require("./GameMoney.js");
  gameMoney.giveMoney(id,value);
}

commandFunctions.timeskip = function() {
  const gameTime = require("./GameTime.js");
  gameTime.setTime(61,true);
}