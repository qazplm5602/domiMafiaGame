let Login = new Array();
Login.LoginIng = false; // 로그인 하는중

$(document).ready(function(){
    $("#login-start").click(Login.LoginStart);

    // 오류 받기
    ipcRenderer.on('MainLoginError', (event, why) => {
        Login.faildLogin(why);
    });
    // 로그인 시작 애니메이션
    ipcRenderer.on('LoginStartScreen', (_,userid) => {
        Login.Startanimation(userid);
    });
});

Login.updateLoginText = function() {
    const login_id = $('#login-id').val();
    const login_password = $('#login-password').val();

    // 오류 class 가 있다면 지움
    if ($('#login-id').hasClass('error') || $('#login-password').hasClass('error')) {
        $('.login-box input').removeClass('error');
    }

    if (login_id.length <= 0 || login_password.length <= 0) {
        $('#login-start').removeClass("active");
        return
    }

    $('#login-start').addClass("active");
}

// 로그인 시작
Login.LoginStart = function() {
    if (Login.LoginIng || !$("#login-start").hasClass('active')) return;

    // 오류 class 가 있다면 지움
    if ($('#login-id').hasClass('error') || $('#login-password').hasClass('error')) {
        $('.login-box input').removeClass('error');
    }
    $('.login-error').text('').hide();
    Login.LoginIng = true;

    // 입력창 비활성화
    $('#login-password').attr('disabled',true);
    $('#login-id').attr('disabled',true);
    $('#login-start').removeClass("active");

    const login_id = $('#login-id').val();
    const login_password = $('#login-password').val();

    if (login_id.length <= 0 || login_password.length <= 0) {
        Login.faildLogin('아이디 및 비밀번호를 입력 해주세요.')
        return;
    }

    ipcRenderer.send('MainLogin',{id:login_id,password:login_password});
}

// 오류 처리
Login.faildLogin = function(why) {
    $('.login-box input').addClass('error');
    $('.login-error').text(why).show();
    Login.LoginIng = false;
    $('#login-password').attr('disabled',false);
    $('#login-id').attr('disabled',false);
    $('#login-start').addClass("active");
}

// 로그인 애니메이션
Login.Startanimation = function(userid) {
    $('#login-name').text(userid);
    $('.login-box').children().fadeOut(300);
    setTimeout(() => {
        $('.login-box').animate({
            width:'100%'
        },300,'swing',function() {
            $('.login-ing').css({transform:'translate(-50%,-50%) scale(1)',opacity:1});
            setTimeout(() => {
                ipcRenderer.send('LoginStart');
            }, 2000);
        });
    }, 300);
}