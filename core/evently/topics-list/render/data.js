function(e, newItems) {
    e.stopPropagation();
    
    var $$this = $$(this);
    
    newItems = newItems || {};
    
    var filter = getFilter();
    
    var topicsByDB = $$("#id_topics").topicsByDB[filter.db.type];
    var topics;
    if (filter.db.name && topicsByDB && topicsByDB[filter.db.name]) {
        topics = topicsByDB[filter.db.name];
    } else {
        topics = [];
    }
    
    var topicsTime = $$this.topics;
    
    var items = [];
    topics = topics.filter(function(topic) {
        return !filter.tag || topic.tags && topic.tags.indexOf(filter.tag) !== -1;
    });

    $$this.hasTopics = topics.length > 0;
    
    topics.forEach(function(topic) {
        var filter = {topic: topic};
        var links = getTopicTagsMenu(topic, filter)
            .filter(function(l, i) {return i && !l.hide;})
            .map(function(link) {
                return {
                    url: link.url,
                    badge: link.tag,
                    title: link.title
                };
            });
        
        var d = topicsTime[topic._id] ? topicsTime[topic._id] : topic.created_at;
        var date = $.timeago.parse(d);
        var time = API.formatShortDate(date);
        
        items.push({
            id: topic._id,
            url: getUrlByFilter(filter),
            title: topic.title,
            datetime: date,
            time: time,
            links: links,
            archived: topic.archived,
            isNew: newItems[topic._id],
            offline: !topic._rev
        });
    });
    
    items.sort(function(a, b) {
        if (a.datetime > b.datetime) {
            return -1;
        } else if (a.datetime < b.datetime) {
            return 1;
        } else {
            return 0;
        }
    });
    
    items.push({
      hidden: true
    });

    return {
        topics: items
    };
}
