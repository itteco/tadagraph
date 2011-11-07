function(e, isCreator) {
    e.stopPropagation();
    
    var $contextMenu = $('.stream-context', this);
    if (isCreator) {
        $contextMenu.find('[data-action="edit"]').show();
        $contextMenu.find('[data-action="delete"]').show();
        
    } else {
        $contextMenu.find('[data-action="edit"]').hide();
        $contextMenu.find('[data-action="delete"]').hide();
    }
    $contextMenu.show();
}
