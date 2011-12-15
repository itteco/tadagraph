function(e, filter) {
    e.stopPropagation();
    
    var $this = $(this);
    
    API.filterTopics(filter, function(_error, topics) {
        $this.trigger("render", [topics]);
    });
}