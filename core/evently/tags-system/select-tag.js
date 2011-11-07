function(e, tag) {
    e.stopPropagation();
    
    var $this = $(this);
    
    if (API.filterState.tag == tag)
        API.filterState.tag = "";
    
    else 
        API.filterState.tag = tag;
    
    $this.trigger("render");
    $this.trigger("filter-state-changed", [API.filterState, "tag"]);
}
