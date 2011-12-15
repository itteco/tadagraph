function(e, type, term) {
    
    var $$this = $$(this);
    
    var meta = $$(this).meta;

    var topicsByTitle = $$this.topicsByTitle;
    
    var addMeta = function(type, id, label) {
        for (var i = 0; i < meta.length; i++)
            if (meta[i].type == type && meta[i].id == id) {
                if (meta[i].deleted) {
                    delete meta[i].deleted;
                    return true;
                }
            
                if (meta[i].label != label) {
                    meta[i].label = label;
                    meta[i].updated = true;
                    
                } else {
                    return false;
                }
            }

        meta.push({ type: type, id: id, label: label, 'new': true });
        return true;
    }
    
    switch (type) {
        case "hashtag":
            addMeta('hashtag', term, '#' + term);
            break;
            
        case "member":
            var person = API.profile(term);
            if (person) {
                addMeta('member', person.id, '@' + person.nickname);
            }
            break;
            
        case "topic":
            var title = term;
            var topic = topicsByTitle[title.toLowerCase()];

            if (topic) {
                addMeta('topic', topic._id, '[' + topic.title + ']');

            } else {
                var id = new Date().getTime();
                addMeta('topic', id, '[' + title + ']');
            }
            break;
            
        case "cp":
            addMeta('cp', 'cp', "$" + term + "cp");
            break;
    }
}
