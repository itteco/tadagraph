function() {
    var $dialog = $('.dialog-view-add', this);
    var $button = $('.submit', this);
    $$(this).dialog = $dialog;
    
    var elem = this;

    $dialog.dialog({
        autoOpen: false,
        resizable: false,
        height: 100,
        title: 'Add topic tags',
        close: function(){
            if ($$(elem).button)
                $$(elem).button.removeClass('selected');
        }
    });
    
    $button.click(function() {
        $(elem).trigger("saveTags");
        return false;
    });
}