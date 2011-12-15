function(e, $item, doc) {
    var $$this = $$(this);
    
    $$this.parentDoc = doc;
    
    $$this.openDialog($item);
    
    $$this.updateSubmitLabel();
}