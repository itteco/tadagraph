function(e, viewTags) {
    e.stopPropagation();
    
    $$(this).viewTags = true;
    $$(this).tags = viewTags;
    $(this).trigger("render");
}
