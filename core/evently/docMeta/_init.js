function(e, $page) {
    e.stopPropagation();
    
    $.evently.connect($page, this, ["doc"]);
}
