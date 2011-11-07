function(e, doc) {
    e.stopPropagation();
    
    if ($$(this).items[doc._id]) {
        var $status = $('#id_inline_form');
        
        $(document.body).append($status);
        $('.item-status-form').remove();
        $('.flow .state-active').removeClass('state-active');
        
        var $item = $('li.item[data-id="' + doc._id + '"]', this);
        var $statusForm = $('<li class="item-status-form"></li>');
        $statusForm.addClass('thread level-' + (parseInt($item.data("level")) + 1));
        $statusForm.append($status);
        $item.after($statusForm);
        
        $item.addClass('state-active');
        
        $status.show().trigger("reply", [doc, {doNotShowReceiver: true}]);
    }
}
