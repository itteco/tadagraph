function(e, filterState, property) {
    e.stopPropagation();
    
    var $this = $(this);
    
    if (property == "hide-archived") {
        $this.trigger("applyFilter");
    } else if (property == "hide-unstarred") {
        $this.trigger("applyFilter");
    }
}
