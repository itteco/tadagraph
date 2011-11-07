function() {
    var showArchived = !(API.filterState["hide-archived"]);
    var showOnlyStarred = API.filterState["hide-unstarred"];
    
    $(".item", this).each(function() {
        var $item = $(this);
        var archived = $item.hasClass("archived");
        // TODO: is it good check for "followed" topic?
        var starred = $item.find(".starred").size() > 0;
        if ((!showArchived && archived) || (showOnlyStarred && !starred)) {
            $item.hide();
            $item.removeClass("shown");
        } else {
            $item.show();
            $item.addClass("shown");
        }
    });
    
    if ($(".item:visible", this).length > 0) {
        $(".tip", this).hide();
    } else {
        $(".tip", this).show();
    }
}