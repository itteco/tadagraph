function(e, topics) {
    e.stopPropagation();
    
    var filter = getFilter();
    
    var filterTag = "";
    
    var view = getMenuItem(filter, filter.view);
    if (view) {
        filterTag = view.tag || "";
    }
    
    var filteredTopics = [];
    if (filter.db.name && filter.db.type != "user") {
        $.forIn(topics, function(topicId, topic) {
            if (!topic.archived && (!topic.tags || topic.tags.indexOf(filterTag) >= 0) && topic._id != filter.topicId)
                filteredTopics.push(topic);
        });
    }

    var all_topics_url = getUrlByFilter({db: getFilter().db, view: "topics"});

    filteredTopics.sort(function(a, b) {
        a.created_at = API.parseDate(a.created_at);
        b.created_at = API.parseDate(b.created_at);
        if (a.created_at != b.created_at) {
            if (a.created_at < b.created_at)
                return 1;
            else
                return -1;
        }
        return 0;
    });

    filteredTopics = filteredTopics.slice(0, 5);

    var html = '';

    filteredTopics.forEach(function(topic) {
        var filter = getFilterWithTopic(getFilter(), topic);
        var url = getUrlByFilter(filter);
        html += '<li class="item"><a href="' + url + '">' + topic.title + '</a></li>';
    });
    html += '<li class="item"><a href="' + all_topics_url + '" class="extra">All topics</a></li>';

    $('.sys-topics-list').html(html);
}
