function(e, filter) {
    e.stopPropagation();
    
    var $this = $(this);
    
    if (!($this.is(":visible")) || !filter.db.name)
        return;
    
    // Erase widget content before loading.
    $this.html("");
    
    var topics = $$(this).topics;
    
    $this.trigger("showLoading");
    
    var DB = API.filterDB(filter);
    DB.view("core/actual-topics", {
        group: true,
        startkey: [DB.type, DB.name],
        endkey: [DB.type, DB.name, "\ufff0"],
        success: function(data) {
            for(var id in topics) {
                delete topics[id];
            }
            data.rows.forEach(function(row) {
                topics[row.key[2]] = row.value;
            });
            
            $this.trigger("hideLoading");
            
            $this.trigger("render");
        }
    });
    
    unregisterChangesListener("new actual topic");
    registerChangesListener(DB, function(docs) {
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
                    if (!topics[topic._id] || topics[topic._id] < adoc.created_at) {
                       topics[topic._id] = adoc.created_at;
                       newItems[topic._id] = true;
                       changed = true;
                    }
                });
            }
        });
        if (changed) {
            $this.trigger("render", [newItems]);
        }
    }, "new actual topic");
}