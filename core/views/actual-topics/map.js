function(doc) {
    if (doc.created_at) {
        if (doc.topic) {
            emit([doc.db.type, doc.db.name, doc.topic._id], doc.created_at);
        }
        
        if (doc.topics) {
            for (var i = 0; i < doc.topics.length; i++) {
               var topic = doc.topics[i];
               emit([doc.db.type, doc.db.name, topic._id], doc.created_at);
            }
        }
    }
}