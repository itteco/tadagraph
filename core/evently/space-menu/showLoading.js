function(e) {
    e.stopPropagation();
    
    var $menu = $("a.selected", this);
    if ($menu.length == 0) {
        $menu = $("a:first", this);
    }
    $menu.prev().show();
}