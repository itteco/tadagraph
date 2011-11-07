function(doc) {
    if (doc.type == 'notification') {
        emit(doc.ref._id, {rev: doc._rev});
    }
}
