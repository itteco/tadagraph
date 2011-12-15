(function(doc) {
    if (doc.type == 'status')
        for (var cursor = doc; cursor; cursor = cursor.parent)
            emit(cursor._id, {rev: doc._rev});
})
