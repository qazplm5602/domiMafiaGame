let KeyManager = new Array();

$(function() {
    $(document).keydown(function(e) {
        KeyManager.forEach(element => {
            element(e.keyCode);
        })
    });
});