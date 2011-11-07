function(doc) {
    if (doc.type == 'notification' && doc.ref.tags) {
        var created_at = (new Date(doc.created_at)).getTime();
        var tagsDict = {};
        var tags = doc.ref.tags;
        for (var i = 0; i < tags.length; i++) {
            tagsDict[tags[i]] = true;
        }
        for (var tag in tagsDict) {
            emit(tag, created_at);
        }
    }
}
