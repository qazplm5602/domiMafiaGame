let mapNotify = new Array();
mapNotify.id = 0;

mapNotify.add = (title,content,time) => {
    mapNotify.id ++;
    const id = mapNotify.id;

    $("#mapNotify-main").append(`
        <div id="mapNotify-id-${id}">
            <div class="mapNotify-title">${escapeHtml(title)}</div>
            <div class="mapNotify-content">${escapeHtml(content)}</div>
        </div>
    `);

    const $element = $("#mapNotify-id-"+id);
    setTimeout(() => $element.css("opacity",1), 10);

    // 사라지기
    setTimeout(() => {
        $element.css({
            opacity:0,
            transform:"scale(1.1)"
        });
        setTimeout(() => $element.remove(), 250);
    }, 1000 * (time || 5));
}

CallBack["mapNotify.add"] = data => {
    mapNotify.add(data.title,data.content,data.time);
}