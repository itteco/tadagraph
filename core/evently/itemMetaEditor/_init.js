function(e, options) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    $$this.options = options || {};
    var doc = $$this.doc = options.doc;
    var filter = API.filterPrepare({parent: doc});
    
    { // fill meta
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

        var storedTopics = $$("#id_topics").storedTopics;
        getDocTopics(doc).forEach(function(topic) {
            topic = storedTopics[topic._id] || topic;
            meta.push({type: 'topic', id: topic._id, label: topic.title});
        });

        if (doc.cp) {
            meta.push({type: "cp", id: "cp", label: "$" + doc.cp + "cp" });
        }
    }
    
    { // fill terms
        var $$topics = $$("#id_topics");

        var terms = $$this.terms = [];
        { // topics
            var topics = ($$topics.topicsByDB[doc.db.type] || {})[doc.db.name] || [];
            topics.forEach(function(topic) {
                if (!topic.archived)
                    terms.push("[" + topic.title + "]");
            });
        }

        { // members
            var space = API.filterSpace(filter);
            if (space) {
                space.allMembers.forEach(function(userid) {
                    var p = API.profile(userid);
                    if (p)
                        terms.push("@" + p.nickname);
                });
            }
        }
    }
    
    var stepCount = 1;
    var stepNext = function() {
        if (--stepCount === 0) {
            stepFinish();
        }
    };
    
    var stepFinish = function() {
         $this.trigger("render");
    };
    
    API.filterTags(filter, function(error, items) {
        items.forEach(function(item) {
            terms.push("#" + item.tag);
        });
        
        stepNext();
    });
}
