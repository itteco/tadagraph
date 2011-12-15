(function(doc) {
    if (doc.type == "follow") {
        emit(doc.created_by, {_id: doc._id});
    }
})
