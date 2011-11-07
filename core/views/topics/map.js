function(doc) {
    if (doc.type == 'topic')
        emit([doc.db.type, doc.db.name, doc.title.toLowerCase()], {rev: doc._rev});
}
