function(e, filter) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    $$this.viewTags = false;
    
    API.filterTags(filter, function(error, items) {
        if (!$$this.viewTags) {
            if (error) {
                console.error(error);
                
            } else {
                var tags = {};
                items.forEach(function(item) {
                    if (!(item.tag in tags) || tags[item.tag] < item.last_used_at)
                        tags[item.tag] = item.last_used_at;
                });
                $$this.tags = tags;
                $this.trigger('render', [tags]);
            }
        }
    }, 'tags-user');
}
