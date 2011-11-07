function(e, doc, options) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);

    if (!doc) {
        $this.html("");
        return;
    }
    
    $$this.options = options;

    var sameDoc = $$this.doc && $$this.doc._id == doc._id;
    $$this.doc = doc;
    
    { // fill meta
        var meta = $$this.meta = [];
        if (doc.owners) {
            doc.owners.forEach(function(owner) {
                meta.push({type: 'member', id: owner.id, label: '@' + owner.nickname});
            });
        }

        if (doc.tags) {
            var tagsDesc = API.tags.desc(API.filterPrepare({parent: doc}));
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
            var database = API.filterSpace({parent: doc});
            if (database) {
                database.allMembers.forEach(function(userid) {
                    var profile = API.profile(userid);
                    if (profile)
                        terms.push("@" + profile.nickname);
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
    
    API.filterTags(API.filterPrepare({parent: doc}), function(error, items) {
        items.forEach(function(item) {
            terms.push("#" + item.tag);
        });
        
        stepNext();
    });

    if (!sameDoc) {
        unregisterChangesListener("document-meta");
        registerChangesListener(API.filterDB({parent: doc}), function(docs) {
            if (!($this.is(":visible")))
                return;
            docs.forEach(function(d) {
                if (d._id == doc._id) {
                    if (d._deleted) {

                    } else {
                        $this.trigger("doc", [d]);
                    }
                }
            });
        }, "document-meta");
    }
}
