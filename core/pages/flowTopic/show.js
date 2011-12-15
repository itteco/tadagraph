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
    
    var DB = API.filterDB(filter);
    
    function loadTopicTags() {
        DB.view('core/topics-tags', {
            startkey: [topicId],
            endkey: [topicId, {}],
            group: true,
            success: function(data) {
                var tags = {};
                data.rows.forEach(function(row) {
                    var tag = row.key[1];
                    if (!(tag in tags) || tags[tag] < row.value)
                        tags[tag] = row.value;
                });
                
                $(document.body).trigger('view-tags', [tags]);
            },
            error: function(status, error, reason) {
                $.log(status, error, reason);
            }
        });
    }
    
    loadTopicTags();
    
    API.registerChangesListener(DB, function(docs) {
        if ($(page).is(':visible')) {
            docs = docs.filter(function(doc) {
                return doc.topics && doc.topics.filter(function(topic) { return topic._id == topicId; }).length;
            });

            if (docs.length) 
                loadTopicTags();
        }
    }, "topic-flow-tags");
}
