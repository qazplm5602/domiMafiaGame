class MafiaPlayer {
    constructor (ws,name) {
        this.name = escapeHtml(name);
        this.ws = ws;
    }

    inventory = {};
    money = 0;
    job = "citizen";
    died = false;
    LobbyReady = false;
    avatar = "./assets/logo/domi.png";
}

// XSS 공격 방어
function escapeHtml(str) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}

module.exports = MafiaPlayer;