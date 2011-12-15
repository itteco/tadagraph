(function(doc) {
    if (doc.type == 'status' && doc.tags) {
        var created_at = (new Date(doc.created_at)).getTime();
        var tagsDict = {};
        var tags = doc.tags;
        for (var i = 0; i < tags.length; i++) {
            tagsDict[tags[i]] = true;
        }
        for (var tag in tagsDict) {
            emit(tag, created_at);
        }
    }
})
