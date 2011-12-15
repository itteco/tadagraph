function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    $$this.mutedTags = $$().get("mutedTags") || {}
    
    API.connectVisible(document.body, $this, ['view-tags', 'entered-tag']);
}
