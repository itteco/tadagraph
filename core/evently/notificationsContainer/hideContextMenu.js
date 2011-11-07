function(e) {
    e.stopPropagation();
    
    var $contextMenu = $('.stream-context', this);
    $('.state-active', this).removeClass('state-active');
    $contextMenu.hide();
}
