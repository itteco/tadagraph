function(e) {
    e.stopPropagation();
    
    $(this).trigger("render");
}
