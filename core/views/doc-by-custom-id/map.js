(function(doc) {
    if (doc.db && doc.db.type && doc.db.name) {
        if (doc.intId && (typeof(doc.intId) == 'number')) {
            emit(["intId", doc.db.type, doc.db.name, doc.intId], {rev: doc._rev});
        }
        if (doc.slug) {
            emit(["slug", doc.db.type, doc.db.name, doc.slug], {rev: doc._rev});
        }
    }
})
