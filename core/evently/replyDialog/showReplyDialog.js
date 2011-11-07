function(e, $item, doc) {
    var $$this = $$(this);
    
    $$this.parentDoc = doc.ref || doc;
    
    $$this.openDialog($item);
    
    $$this.updateSubmitLabel();
}