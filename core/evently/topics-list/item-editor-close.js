function(e) {
    e.stopPropagation();

    var $form = $(e.target);
    var $item = $$(this).editableItem;
    
    $form.hide();
    if ($item) {
        $item.show();
        $$(this).editableItem = null;
    }
} 
