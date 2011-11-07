function(page, match, widgets, filter) {
    var topicId = match[1];
    var tag = match[2];
    
    getTopic(filter, topicId, function(topic) {
    
        // We need topic object (not id) in filter to force work status form in topic context.
        
        $.extend(filter, {
            tag: tag,
            topic: topic,
            view: 'flow'
        });
        
        setFilter(filter);
        API.setTitle(filter);
        
        $('.sys-page-header', page).trigger('setOptions', [{
            title: topic.title,
            filter: filter
        }]);
    });
    
    API.filterDB(filter).view('core/topics-tags', {
        startkey: [filter.db.type, filter.db.name, topicId], // TODO: hide db
        endkey: [filter.db.type, filter.db.name, topicId, {}],
        group: true,
        success: function(data) {
            var tags = {};
            data.rows.forEach(function(row) {
                tags[row.key[3]] = row.value;
            });
            $(document.body).trigger('view-tags', [tags]);
        },
        error: function(status, error, reason) {
            $.log(status, error, reason);
        }
    });
}
