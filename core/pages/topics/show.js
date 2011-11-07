function(page, match, widgets, filter) {
    var tag = match[1];
    
    $.extend(filter, {
        tag: tag,
        view: 'topics'
    });
    
    setFilter(filter);

    API.setTitle($.extend({
        application: 'Topics'
    }, filter));
    
    var desc = filter.tag && getTopicTagDesc(filter, filter.tag) || null;
    
    $('.sys-page-header', page).trigger('setOptions', [{
        title: (desc ? desc.title + ' ' : '') + 'Topics'
    }]);
}
