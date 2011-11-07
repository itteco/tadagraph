function(e) {
    e.stopPropagation();
    $$(this).items = {};
    
    $('.flow .item', this).live('mouseover mouseout', function(event) {
        if (event.type == 'mouseover') {
            $(this).addClass('state-hover');
            
        } else {
            $(this).removeClass('state-hover');
        }
    });
}
