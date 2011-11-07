function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    var DB = API.userDB();
    
    // Hardcode, but reasonable.
    var topics = $$this.topicsByDB = {};
    
    // Dict.
    var storedTopics = $$this.storedTopics = {};
    
    DB.view("core/topics", {
        include_docs: true,
        success: function(data) {
            var topics = [];
            data.rows.forEach(function(row) {
                if (pushTopic(row.doc)) {
                    topics.push(row.doc);
                }
            });
            $$this.loaded = true;
            $this.trigger("topicsLoaded", [topics, true]);
        }
    });
    
    registerChangesListener(DB, function(docs) {
        var topics = [];
        var oldTopics = {};
        docs.forEach(function(doc) {
            if (doc.type == 'topic') {
                var oldTopic = pushTopic(doc)
                if (oldTopic) {
                    topics.push(doc);
                    if (oldTopic._id) {
                        oldTopics[oldTopic._id] = oldTopic;
                    }
                }
            }
        });
        if (topics.length > 0)
            $this.trigger("topicsLoaded", [topics, false, oldTopics]);
    });
    
    function pushTopic(topic) {
        // Specific error in local deployment
        if (!topic.db)
            return false;
        
        var oldTopic = storedTopics[topic._id];
        storedTopics[topic._id] = topic;
        
        if (!(topic.db.type in topics))
            topics[topic.db.type] = {};
        
        if (!('' in topics[topic.db.type]))
            topics[topic.db.type][''] = [];
        
        if (!(topic.db.name in topics[topic.db.type]))
            topics[topic.db.type][topic.db.name] = [];
        
        var spaceTopics = topics[topic.db.type][topic.db.name];
        var added = false;
        spaceTopics.forEach(function(atopic, i) {
            if (atopic._id == topic._id) {
                spaceTopics[i] = topic;
                added = true;
            }
        });
        
        if (!added) {
            topics[topic.db.type][''].push(topic);
            spaceTopics.push(topic);
        }
        
        return oldTopic || true;
    }
}
