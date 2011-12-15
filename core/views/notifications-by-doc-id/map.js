(function(doc) {
    if (doc.type == 'status') {
        emit(doc._id, {rev: doc._rev});
    }
})
