function(page, match, widgets, filter) {
    try {
    var tag = match[1] || '';
    
    $.extend(filter, {
        view: 'flow',
        tag: tag
    });
    
    API.normalizeFilter(filter, function(url) {
        if (url) {
            document.location.href = url;
            
        } else {
            API.setTitle(filter);
            setFilter(filter);

            $('.home a.item', page).parent().addClass('selected');
        }
    });
    } catch (e) {
        $.log(e);
    }
}
