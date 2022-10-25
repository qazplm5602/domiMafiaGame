let itemshop = new Array();

itemshop.show = () => {
    $("#itemshop-main").show();
    $(".itemshop-header-menu > button").first().trigger("click");
}

itemshop.SetHelpBoxPostion = (X,Y) => {
    $('#itemshop-helpbox').css({
        left:  X,
        top:   Y
    });

    let screenWidth = window.screen.width;
    let percentage = ( screenWidth - X ) / screenWidth ;
    
    let TrnasX = "15px";
    let TrnasY = "15px";

    if (percentage < 0.4) {
        TrnasX = "-100%";
    }

    let TOPpercentage = ( screenWidth - Y ) / screenWidth ;
    if (TOPpercentage < 0.65) {
        TrnasY = "-100%";
    }
    
    $('#itemshop-helpbox').css({transform:"translate("+TrnasX+","+TrnasY+")"});
}

itemshop.changeMenu = async menu => {
    $(".itemshop-content").empty();

    let Items = await $.AgetJSON("./assets/Items/itemList.json");
    if (Items === undefined) { // 크래쉬
        console.error("아이템 리스트를 불러올 수 없습니다.");
        ipcRenderer.send("gamemain.panic","아이템 리스트를 불러올 수 없습니다.");
        return;
    }

    let List = await $.AgetJSON("./assets/itemshop/"+menu+".json");
    if (List === undefined) {
        console.error("상점을 불러올 수 없습니다.");
        return;
    }

    $.each(List, function(title,items) {
        $(".itemshop-content").append(`<div class="itemshop-textline"><span>${title}</span><span></span></div>`);

        let itemBoxElement = '';
        items.forEach(itemcode => {
            let itemdata = Items[itemcode];
            if (itemdata !== undefined) {
                itemBoxElement += `<div class="itemshop-itemlist-item" data-name="${itemdata.name}" data-id="${itemcode}" data-explain="${itemdata.info}">
                    <img class="itemshop-itemlist-item-icon" src="./assets/Items/${itemcode}.png">
                    <span class="itemshop-itemlist-item-price">${numberWithCommas(itemdata.price)}</span>
                </div>`;
            }
        });

        $(".itemshop-content").append(`
            <section class="itemshop-itemlist">
            ${itemBoxElement}
            </section>
        `);
    });
}

$(function() {
    $( "#itemshop-main" ).draggable({
        containment:"#gamemain-screen",
    });

    // 아이템 구매확인
    $(document).on('click', '.itemshop-itemlist > .itemshop-itemlist-item', function(){
        let name = $(this).data("name");
        let itemcode = $(this).data("id");
        
        $(".itemshop-checkbuy-title").text(name+" 아이템을 구매하시겠습니까?");
        $(".itemshop-checkbuy").data("id",itemcode).fadeIn(200);
    });

    // 아이템 구매
    $(".itemshop-checkbuy-buttons > button.buy").click(function() {
        let itemcode = $(".itemshop-checkbuy").data("id");
        if (itemcode === undefined) return;

        socket.send("itemshop.buy",{ code:itemcode });
        $(".itemshop-checkbuy-buttons > .close").trigger("click");
    });

    // 스킬 설명박스 따라가게
    $(document).on('mousemove', function(e){
        if ($("#itemshop-helpbox").css("display") === "none") return;

        itemshop.SetHelpBoxPostion(e.pageX,e.pageY);
    });

    $(document).on('mouseenter', '.itemshop-itemlist-item', function(e){
        let title = $(this).data("name") || "Unknown";
        let explain = $(this).data("explain") || "Unknown";
        let imgURL = $(this).find(".itemshop-itemlist-item-icon").attr('src') || "Unknown";

        $(".itemshop-helpbox-iteminfo-texts > .nameT").text(title);
        $(".itemshop-helpbox-explain").text(explain);
        $(".itemshop-helpbox-iteminfo-img").attr('src',imgURL);
        $('#itemshop-helpbox').stop().fadeIn(300);
    });
    $(document).on('mouseleave', '.itemshop-itemlist-item', function(e){
        $('#itemshop-helpbox').stop().fadeOut(100);
    });

    $(".itemshop-checkbuy-buttons > .close").click(function() {
        $(".itemshop-checkbuy").removeData("id").fadeOut(100);
    });

    $(".itemshop-header-close").click(function() {
        $("#itemshop-main").hide();
        $(".itemshop-header-menu > button.active").removeClass("active");
        $(".itemshop-content").empty();
        $(".itemshop-checkbuy").stop().removeData("id").hide(0);
    });

    $(".itemshop-header-menu > button").click(function() {
        let menu = $(this).data("menu");
        if (menu === undefined || menu === $(".itemshop-header-menu > button.active").data("menu")) return;

        $(".itemshop-header-menu > button.active").removeClass("active");
        $(this).addClass("active");

        itemshop.changeMenu(menu);
    });
});

// notify
itemshop.notifyId = 0;

itemshop.notifyAdd = (content,success) => {
    itemshop.notifyId ++;
    const id = itemshop.notifyId;

    $(".itemshop-notify").append(`<div class="itemshop-notify-box" style="transform: translate(30px,0); opacity: 0;" id="itemshop-notify-${id}"><img src="./assets/itemshop/error_icon.svg"> ${content}</div>`);

    const $element = $("#itemshop-notify-"+id);
    setTimeout(() => {
        if (success) {
            $element.attr("style","background: rgba(72, 255, 0, 0.3);");
            $element.find("img").attr("src","./assets/itemshop/success_icon.svg");
        } else {
            $element.attr("style","");
        }
    }, 10);

    setTimeout(() => {
        $element.css({transform: "translate(30px,0)", opacity:0});
        setTimeout(() => {
            $element.remove();
        }, 250);
    }, 5000);
}

CallBack["itemshop.notify"] = function(data) {
    itemshop.notifyAdd(data.content, data.success === true);
}