function(e) {
    var $form = $(e.target);
    var $item = $$(this).editableItem;
    if (!$item) {
        var list = $('ul.list.topic', this),
            last_item = list.find('>li:last');

        list.append($item = $$(this).editableItem = last_item.clone());
        $item.data('id', null);
        $item.find('div.col.meta .date').text('');
        $item.find('div.col.meta ul').html('');
    }

    $form.trigger("item-editor-close");
    $item.trigger("item-save");
}
