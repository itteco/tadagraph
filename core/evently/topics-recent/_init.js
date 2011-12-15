function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    
    $(document).bind('topics-changed', function(e, topics, filter) {
        if (API.filterId(filter) == API.filterId(getFilter())) {
            API.filterTopics(filter, function(_error, topics) {
                $this.trigger("render", [topics]);
            });
        }
    });
}
