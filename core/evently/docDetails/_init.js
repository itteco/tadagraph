function(e, $page) {
    e.stopPropagation();
    
    $.evently.connect($page, this, ["doc"]);
    
    $('.flow .item', this).live('mouseover mouseout', function(event) {
        if (event.type == 'mouseover') {
            $(this).addClass('state-hover');
            
        } else {
            $(this).removeClass('state-hover');
        }
    });
}
