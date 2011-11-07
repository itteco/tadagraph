function (doc, req) {
    if (doc.type === 'notification') {
        var documentTime = new Date(doc.created_at).getTime(),
            currentTime = new Date().getTime();
            
        if (!doc.created_at || (documentTime < currentTime - 86400000)) {
          return false;
        }
    }
    return doc.type && doc.type != 'project-last-sequence' &&
           doc.type != 'team-last-sequence' && doc.type != "log" && doc.type != "id-acquire" ||
           doc._deleted;
}
