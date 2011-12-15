function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    if ($$this.hide_unstarred != API.filterState['hide-unstarred'])
        $this.trigger('filter-state-changed', [API.filterState, 'hide-unstarred']);
}
