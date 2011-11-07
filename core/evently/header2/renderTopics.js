function() {
    var filter = getFilter();
    
    var filterTag = "";
    
    var view = getMenuItem(filter, filter.view);
    if (view) {
        filterTag = view.tag || "";
    }
    
    var topicsByDB = $$("#id_topics").topicsByDB;
    var topics;
    if (filter.db.name && filter.db.type != "user" && (topicsByDB[filter.db.type] || {})[filter.db.name]) {
        topics = topicsByDB[filter.db.type][filter.db.name];
    } else {
        topics = [];
    }
    
    var filteredTopics = topics.filter(function(topic) {
        return !topic.archived && (!topic.tags || jQuery.inArray(filterTag, topic.tags) >= 0) && topic._id != filter.topicId;
    });
    
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
