function(doc) {
    if (doc.type !== 'user-storage-property') return;
    emit(doc.key, {
        value: doc.value,
        _rev: doc._rev
    });
}
