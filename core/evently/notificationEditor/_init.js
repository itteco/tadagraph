function(e, text, options) {
    e.stopPropagation();
    
    $$(this).options = options || {};

    $(this).trigger("render", [text]);
}
