(function (doc, req) {
    if (doc.type === 'status') {
        var documentTime = new Date(doc.created_at).getTime(),
            currentTime = new Date().getTime();
            
        if (!doc.created_at || (documentTime < currentTime - 86400000)) {
          return false;
        }
    }
    return doc.type != "log" && doc.type != "id-acquire" ||
           doc._deleted;
})
