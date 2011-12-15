function(e, id) {
    e.stopPropagation();
    
    var $$this = $$(this);
    
    if ($$this.items[id]) {
        var doc = $$this.items[id];
        
        var $status = $('#id_inline_form');
        
        $(document.body).append($status);
        $('.item-status-form').remove();
        $('.flow .state-active').removeClass('state-active');
        
        var $item = $('li.item[data-id="' + doc._id + '"]', this).parent();
        var $statusForm = $('<li class="item-status-form"></li>');
        $statusForm.addClass('thread level-' + (parseInt($item.data("level")) + 1));
        $statusForm.append($status);
        $item.after($statusForm);
        
        $item.children().addClass('state-active');
        
        $status.show().trigger("reply", [doc, {doNotShowReceiver: true}]);
    }
}
