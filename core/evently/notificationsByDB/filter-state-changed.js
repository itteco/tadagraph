function(e, filterState, property) {
    e.stopPropagation();
    
    var $this = $(this);

    if ($this.is(":visible")) {
        var $$this = $$(this);

        if (property == "hide-unstarred") {
            var value = $$this.hide_unstarred = filterState[property];

            if (value) {
                $(' > li.item:not(.show-since-starred)', this).hide();
                $(' > li.item.show-since-starred', this).removeClass('show-since-starred');
                
            } else {
                $(' > li.item:not(.show-since-starred)', this).show();
                $(' > li.item.show-since-starred', this).hide();
            }
            
            $this.trigger('load');
        }
    }
}
