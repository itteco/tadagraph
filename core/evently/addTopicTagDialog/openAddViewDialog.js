function(e, $button) {
    var $dialog = $$(this).dialog;
    
    $$(this).button = $button;
    
    if ($button.hasClass('selected')) {
        $button.removeClass('selected');
        $dialog.dialog('close');
    }
    else {
        $button.addClass('selected');
        var offset = $button.parent().offset();
        var $window = $(window);
        posTop = offset.top - $window.scrollTop() - 10;
        posLeft = offset.left - $dialog.dialog('option','width') + 10;
        $dialog.dialog('option', 'position', [posLeft, posTop]);
        $dialog.dialog('open');
    }
}