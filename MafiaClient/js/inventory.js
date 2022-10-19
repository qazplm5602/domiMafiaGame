let inventory = new Array();
inventory.myitem = {};

inventory.show = () => {
    $(".inventory-list").empty();
    $("#inventory-main").show();
    inventory.refresh();
}

inventory.refresh = async () => {
    let Items = await $.AgetJSON("../assets/Items/itemList.json");
    if (Items === undefined) { // 크래쉬
        console.error("아이템 리스트를 불러올 수 없습니다.");
        return;
    }
    
    $(".inventory-list").empty();
    $.each(inventory.myitem,function(itemcode,data) {
        $(".inventory-list").append(`
        <div class="itemshop-itemlist-item" data-id="${itemcode}" data-name="${Items[itemcode].name}" data-explain="${Items[itemcode].info}">
            <img class="itemshop-itemlist-item-icon" src="./assets/Items/${itemcode}.png">
            <span>${data.amount}</span>
        </div>
        `);
    });

    $(".inventory-list").append(`<button class="inventory-use">사용하기</button>`);
}

inventory.close = () => {
    $(".inventory-list").empty();
    $("#inventory-main").hide();
}

$(function() {
    $(document).on("click",".inventory-list > div",function() {
        if (!$(this).hasClass("itemshop-itemlist-item")) { // 스킬박스가 아님
            $(".inventory-use").removeData("item").hide();
            return;
        }

        let itemcode = $(this).data("id");
        if (itemcode === undefined) $(".inventory-use").removeData("item");
        let position = $(this).position();
        let left = position.left - 20;
        let top = position.top;

        // 숫자만 추출
        let regex = /[^0-9]/g;

        let nowLeft = Number($(".inventory-use").css("left").replace(regex,""));
        let nowTop = Number($(".inventory-use").css("top").replace(regex,""));

        if (Math.abs(left) === nowLeft && Math.abs(top) === nowTop && $(".inventory-use").css("display") !== "none") {
            $(".inventory-use").removeData("item").hide();
            return;
        }

        $(".inventory-use").data("item",itemcode).css({left:left,top:top}).show();
    });

    // 스킬 사용버튼
    $(document).on("click",".inventory-use",function() {
        const itemcode = $(this).data("item");
        if (itemcode === undefined) return;

        // 서버로 아이템 코드와 함께 전송
        socket.send("inventory.use",{item:itemcode});
    });
});

CallBack["inventory.update"] = function(data) {
    inventory.myitem = data.items;

    // 인벤토리가 켜져있다면.
    if ($("#inventory-main").css("display") !== "none") {
        inventory.refresh();
    }
}