function(e, filterState, property) {
    e.stopPropagation();
    
    var $this = $(this);
    
    $this.trigger("open-flow");
}
