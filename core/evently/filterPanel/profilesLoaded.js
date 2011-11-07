function(e) {
    e.stopPropagation();
    
    $(this).is(':visible') && $(this).trigger('render');
}
