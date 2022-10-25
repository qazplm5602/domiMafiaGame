var { ipcRenderer } = require('electron');

$(document).ready(function(){
    // 창 닫기
    $('#window_close').click(function(){
        ipcRenderer.send('closeApp');
    });
    // 창 최소화
    $('#window_minimize').click(function() {
        ipcRenderer.send('minimzieApp');
    });
});