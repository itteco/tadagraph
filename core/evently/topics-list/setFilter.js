function(e, filter) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    if (!$this.is(":visible") || !filter.db.name)
        return;
    
    // Erase widget content before loading.
    $this.html("");
    
    var topicsTime = $$(this).topicsTime;
    
    $this.trigger("showLoading");
    
    var DB = API.filterDB(filter);
    DB.view("core/actual-topics", {
        group: true,
        startkey: [DB.type, DB.name],
        endkey: [DB.type, DB.name, "\ufff0"],
        success: function(data) {
            for(var id in topicsTime) {
                delete topicsTime[id];
            }
            data.rows.forEach(function(row) {
                topicsTime[row.key[2]] = row.value;
            });
        
            $this.trigger("hideLoading");
            
            API.filterTopics(getFilter(), function(_error, topics) {
                $$this.topics = topics;
                $this.trigger("render");
            });
        }
    });
    
    API.unregisterChangesListener("new actual topic");
    API.registerChangesListener(DB, function(docs) {
        var changed = false;
        var newItems = {};
        docs.forEach(function(adoc) {
            if (adoc.created_at) {
                var atopics = [];
                if (adoc.topic)
                    atopics.push(adoc.topic);
                if (adoc.topics)
                    atopics = atopics.concat(adoc.topics);
                atopics.forEach(function(topic) {
                    if (!topicsTime[topic._id] || topicsTime[topic._id] < adoc.created_at) {
                       topicsTime[topic._id] = adoc.created_at;
                       newItems[topic._id] = true;
                       changed = true;
                    }
                });
            }
        });
        if (changed) {
            API.filterTopics(getFilter(), function(_error, topics) {
                $$this.topics = topics;
                $this.trigger("render", [newItems]);
            });
        }
    }, "new actual topic");
}
