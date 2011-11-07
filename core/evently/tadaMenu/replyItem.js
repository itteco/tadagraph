function(e, $item) {
    e.stopPropagation();
    
    $item.trigger("replyClick");
}
