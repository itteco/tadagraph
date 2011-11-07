function(e) {
    e.stopPropagation();
    
    if (!($$(this).rendered))
        $(this).trigger("render");
}
