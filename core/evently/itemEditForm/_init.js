function() {
    var $$this = $$(this);
    
    $$this.currentItem = null;
    $$this.currentDoc = null;
    $$this.currentDB = getFilter().db; // TODO: hide db
}
