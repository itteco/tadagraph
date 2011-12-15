(function(doc) {
    if (doc.type == 'status') {
        var val = {rev: doc._rev};
        for (var cursor = doc; cursor; cursor = cursor.parent) {
            emit(cursor._id, val);
        }
    }
})
