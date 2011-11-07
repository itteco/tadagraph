function(doc) {
    for (var cursor = (doc.type && doc.type == 'notification')? doc.ref: doc; cursor; cursor = cursor.parent) {
        emit(cursor._id, {rev: doc._rev});
    }
}
