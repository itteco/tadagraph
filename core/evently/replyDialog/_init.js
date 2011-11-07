function(e) {
    e.stopPropagation();
    
    var $$this = $$(this);
    $$this.currentDB = getFilter().db;
    
    if (API.profile()) {
        $(this).trigger("render");
    }
}
