function(e) {
    var filter = getFilter();
    
    var view = getMenuItem(filter, filter.view);
    if (view && view['topics-recent'] === false) {
        return {
            show: false
        }
    }
    
    var title = "Recent topics";
    var filterTag = "";
    
    if (view && view.topicTag) {
        if (view.topicTag.titlePlural)
            title = view.topicTag.titlePlural;
        
        filterTag = view.topicTag.tag || "";
    }
    
    var topicsByDB = $$("#id_topics").topicsByDB;
    var topics;
    if (filter.db.name && filter.db.type != "user" && (topicsByDB[filter.db.type] || {})[filter.db.name]) {
        topics = topicsByDB[filter.db.type][filter.db.name];
    } else {
        topics = [];
    }
    
    var filteredTopics = topics.filter(function(topic) {
        return !topic.archived && (!filterTag || topic.tags && jQuery.inArray(filterTag, topic.tags) >= 0);
    });
    
    // Todolist hardcode for backlog "later".
    if (filterTag == "todo") {
        filteredTopics.push(TODO_BACKLOG_TOPIC);
    }
    if (filterTag == "note") {
        filteredTopics.push(NO_TOPIC);
    }
    
    var all_topics_url = false;
    
    if (filterTag == "discuss" || !filterTag) {
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
        
        filteredTopics = filteredTopics.slice(0, 10);
        
        all_topics_url = getUrlByFilter({db: getFilter().db, view: "topics"})
    }
    
    //var newNotificationsCount = $$(this).newNotificationsCount;
    
    return {
        title: title,
        show: filteredTopics.length > 0,
        hide: filteredTopics.length == 0,
        topics: filteredTopics.map(function(topic) {
            //var count = newNotificationsCount[topic._id] || 0;
            
            var selected = (getFilter().topicId == topic._id && topic._id != "") || (getFilter().topicIds && $.inArray(topic._id, getFilter().topicIds) > -1);
            
            var filter;
            if (selected) {
                filter = getFilterWithoutTopic(getFilter(), topic);
            } else {
                filter = getFilterWithTopic(getFilter(), topic, filterTag == "todo");
            }
            var url = getUrlByFilter(filter);
            
            return {
                id: topic._id,
                title: topic.title,
                url: url,
//                count: count,
                selected: selected
            };
        }),
        all_topics_url: all_topics_url
    };
}
