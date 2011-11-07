function() {
    var filter = getFilter();
    
    var tags = [];
    if (filter.view == 'flow') {
        API.getMenu(filter).forEach(function(item) {
            var viewTags = item.tags || [];
            if (item.tags_by_type && filter.db.type in item.tags_by_type)
                viewTags = item.tags_by_type[filter.db.type];
            
            tags = tags.concat(viewTags);
        });
        
    } else {
        var view = getMenuItem(filter, filter.view) || {};

        var viewTags = view.tags || [];
        if (view.tags_by_type && filter.db.type in view.tags_by_type)
            viewTags = view.tags_by_type[filter.db.type];
        
        tags = tags.concat(viewTags);
    }
    
    var selectedTag = filter.tag;
    tags.sort();
    
    return {
        show: tags.length > 0,
        tags: tags.map(function(tag) { 
            return { 
                selected: tag == selectedTag, 
                url: getUrlByFilter(getFilterWithTag(filter, tag == selectedTag? "": tag)), 
                tag: tag 
            }
        })
    }
}
