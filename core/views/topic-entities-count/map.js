(function(doc) {
    if (doc.type == 'status') {
        
        var topicsDict = {};
        if (doc.topic) {
            topicsDict[doc.topic._id] = true;
        }
        if (doc.topics) {
            for (var i = 0; i < doc.topics.length; i++) {
                topicsDict[doc.topics[i]._id] = true;
            }
        }

        var tagsDict = {
            "flow": true
        };
        var tags = doc.tags;
        if (tags) {
            for (var j = 0; j < tags.length; j++) {
                tagsDict[tags[j]] = true;
            }
        }
        
        for (var topic in topicsDict) {
            for (var tag in tagsDict)
                emit([topic, tag], 1);
        }
    }
})
