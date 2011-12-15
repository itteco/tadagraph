function(e, options) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    $$this.options = options || {};
    var doc = $$this.doc = options.doc;
    var filter = API.filterPrepare({parent: doc});
    
    var terms = $$this.terms = [];
    
    var meta = $$this.meta = [];
    if (doc.owners) {
        doc.owners.forEach(function(owner) {
            meta.push({type: 'member', id: owner.id, label: '@' + owner.nickname});
        });
    }

    if (doc.tags) {
        var tagsDesc = API.tags.desc(filter);
        var compactedTags = API.tags.compact(doc.tags, tagsDesc)
        compactedTags.forEach(function(tag) {
            if (!tagsDesc[tag] || !tagsDesc[tag].hidden)
                meta.push({type: 'tag', id: tag, label: '#' + tag});
        });
    }

    if (doc.cp) {
        meta.push({type: "cp", id: "cp", label: "$" + doc.cp + "cp"});
    }
    
    var space = API.filterSpace(filter);
    if (space) {
        space._allMembers.forEach(function(userid) {
            var p = API.profile(userid);
            if (p)
                terms.push("@" + p.nickname);
        });
    }
    
    var stepCount = 2;
    var stepNext = function() {
        if (--stepCount === 0) {
            stepFinish();
        }
    };
    
    var stepFinish = function() {
         $this.trigger("render");
    };
    
    API.filterTags(filter, function(error, items) {
        if (error) {
            console.error(error);
            
        } else {
            items.forEach(function(item) {
                terms.push("#" + item.tag);
            });
        }
        
        stepNext();
    });
    
    API.filterTopics(filter, function(error, topics) {
        $$this.topics = topics;
        var topicsByTitle = $$this.topicsByTitle = {};
        $.forIn(topics, function(topicId, topic) {
            topicsByTitle[topic.title.toLowerCase()] = topic;
            if (!topic.archived)
                terms.push("[" + topic.title + "]");
        });
        getDocTopics(doc).forEach(function(topic) {
            topic = topics[topic._id] || topic;
            meta.push({type: 'topic', id: topic._id, label: topic.title});
        });
        
        stepNext();
    });
}
