function(e) {
    e.stopPropagation();
    
    $$(this).topics = {};
    
    $('.stream-table .item.clickable', this).live('mouseover mouseout', function(event) {
        if (event.type == 'mouseover') {
            $(this).addClass('state-hover');
            $(this).next().addClass('state-hover-next');
        } else {
            $(this).removeClass('state-hover');
            $(this).next().removeClass('state-hover-next');
        }
    });
    
    $('.stream-table .item.clickable a', this).live('click', function(e){
        e.stopPropagation();
    });
    
    $('.stream-table .item.clickable', this).live('click', function(){
        if ($(this).attr('url')) {
            window.location.href = $(this).attr('url');
        }
    });


}
