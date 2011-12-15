(function(doc) {
    if (doc.type == 'user-storage-property') {
        emit(doc.key, {rev: doc._rev, value: doc.value});
    }
})
