function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    var newUnviewedItems = $$(this).newUnviewedItems;
    newUnviewedItems.splice(0, newUnviewedItems.length);
    
    if ($$this.hide_unstarred != API.filterState['hide-unstarred'])
        $this.trigger('filter-state-changed', [API.filterState, 'hide-unstarred']);
}
