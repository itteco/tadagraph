function(e) {
    var $$this = $$(this);
    
    var filter = getFilter();
    var filterTag = filter.tag;
    var menuItem = getMenuItem(filter, filter.view);
    
    if (menuItem && menuItem['user-tags'] === false) {
        return {
            show: false
        }
    }
    
    var sysTags = {};
    if (filter.view == 'flow') {
        API.getMenu(filter).forEach(function(item) {
            var viewTags = item.tags || [];
            if (item.tags_by_type && filter.db.type in item.tags_by_type)
                viewTags = item.tags_by_type[filter.db.type];
            
            viewTags.forEach(function(tag) {
               sysTags[tag] = true;
            });
        });
        
    } else {
        var view = getMenuItem(filter, filter.view) || {};

        var viewTags = view.tags || [];
        if (view.tags_by_type && filter.db.type in view.tags_by_type)
            viewTags = view.tags_by_type[filter.db.type];
        
        viewTags.forEach(function(tag) {
           sysTags[tag] = true;
        });
    }
    
    var tagsDesc = API.tags.desc(filter);

    var mutedTags = $$this.mutedTags;
    var tagDict = $$this.tags;

    var usedTags = [];

    for (var tag in tagDict) {
        if (!(tag in sysTags) && !tag.match(/\d+/) && !(tag in mutedTags) && !(tag in tagsDesc && tagsDesc[tag].hidden)) {
            usedTags.push(tag);
        }
    }

    if (filterTag && !(filterTag in tagDict) && !(filterTag in sysTags)) {
        usedTags.push(tag);
    }
    
    usedTags.sort();

    var tags = usedTags.map(function(tag) {
        var selected = filterTag == tag;
        return {
            tag: tag,
            selected: selected,
            url: getUrlByFilter(getFilterWithTag(filter, selected? "": tag))
        };
    });

    return {
        show: tags.length > 0,
        tags: tags
    }
}
