function(doc) {
    if (doc.type && doc.type != 'notification')
        for (var cursor = doc; cursor; cursor = cursor.parent)
            emit(cursor._id, {rev: doc._rev});
}
