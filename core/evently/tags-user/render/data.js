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
    
    var tagsDesc = API.tags.desc(filter);

    var mutedTags = $$this.mutedTags;
    var tagDict = $$this.tags;

    var usedTags = [];

    for (var tag in tagDict) {
        if (!(tag in tagsDesc) && !tag.match(/\d+/) && !(tag in mutedTags)) {
            usedTags.push({tag: tag, lastUsedTime: tagDict[tag]});
        }
    }

    if (filterTag && !(filterTag in tagDict) && !(filterTag in tagsDesc)) {
        usedTags.push({tag: filterTag, lastUsedTime: new Date().getTime()});
    }
    
    usedTags.sort(function(a, b) {
        if (a.lastUsedTime > b.lastUsedTime) {
            return -1;
        } else if (a.lastUsedTime < b.lastUsedTime) {
            return 1;
        } else {
            return 0;
        }
    });

    var tags = [];
    var count = 0;
    for(var i in usedTags) {
        var tag = usedTags[i].tag;
        var selected = filterTag == tag;
        tags.push({
            tag: tag,
            selected: selected,
            url: getUrlByFilter(getFilterWithTag(filter, selected? "": tag))
        });
        count += 1;
        if (count == 10)
            break;
    }

    return {
        show: tags.length > 0,
        tags: tags
    }
}
