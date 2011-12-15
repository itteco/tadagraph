(function(doc) {
    if (doc.type == 'status') {
        var val = {rev: doc._rev};
        var i, uid, tag, topic;
        
        var created_at = (Date.parse(doc.created_at)).valueOf();
        
        emit(["all", created_at], val);
        
        for (var cursor = doc; cursor; cursor = cursor.parent) {
            emit(["doc", cursor._id, created_at], val);
        }
        
        var ownersDict = {};
        var owner = doc.owner;
        if (owner) {
            ownersDict[owner.id] = true;
        }
        var owners = doc.owners;
        if (owners) {
            for (i = 0; i < owners.length; i++) {
                ownersDict[owners[i].id] = true;
            }
        }
        
        var tagsDict = {};
        var tags = doc.tags;
        if (tags) {
            for (i = 0; i < tags.length; i++) {
                tagsDict[tags[i]] = true;
            }
        }
        
        var topicsDict = {};
        if (doc.topic) {
            topicsDict[doc.topic._id] = true;
        }
        if (doc.topics) {
            for (i = 0; i < doc.topics.length; i++) {
                topicsDict[doc.topics[i]._id] = true;
            }
        }
        
        for (uid in ownersDict) {
            emit(["user", uid, created_at], val);
        }
        
        for (tag in tagsDict) {
            emit(["tag", tag, created_at], val);
            
            for (uid in ownersDict) {
                emit(["tag-user", tag, uid, created_at], val);
                
            }
        }
        
        for (topic in topicsDict) {
            emit(["topic", topic, created_at], val);
            for (uid in ownersDict) {
                emit(["topic-user", topic, uid, created_at], val);
            }
            for (tag in tagsDict) {
                emit(["topic-tag", topic, tag, created_at], val);
                for (uid in ownersDict) {
                    emit(["topic-tag-user", topic, tag, uid, created_at], val);
                }
            }
        }
    }
})
