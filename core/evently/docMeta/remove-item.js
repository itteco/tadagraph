function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);

    var $item = $(e.target).parent();
    var id = $item.data('value');
    
    var doc = $$this.doc;
    var meta = $$this.meta;

    switch ($item.data('type')) {
        case "tag":
            var tagsDesc = API.tags.desc(API.filterPrepare({parent: doc}));
            var tag = id;
            doc.tags = API.tags.remove(tag, doc.tags, tagsDesc, function(tag, remove) {
                API.tags.handle(tag, doc, remove? "remove": "add", tagsDesc);
                if (remove) {
                    meta.forEach(function(i) {
                        if (i.type == "tag" && i.id == tag) i.removed = true;
                    });
                } else 
                    meta.push({type: 'tag', id: tag, label: '#' + tag, added: true});
            });
            break;
            
        case "member":
            if (doc.owners) {
                for (var i = 0; i < doc.owners.length; i++)
                    if (doc.owners[i].id == id)
                        doc.owners.splice(i, 1);

                meta.forEach(function(i) {
                    if (i.type == "member" && i.id == id) i.removed = true;
                });
            }
            
            if (doc.owner && doc.owner.id == id) delete doc.owner;
            break;
            
        case "topic":
            if (doc.topic && doc.topic._id == id)
                delete doc.topic;

            if (doc.topics) {
                for (i = 0; i < doc.topics.length; i++)
                    if (doc.topics[i]._id == id) {
                        doc.topics.splice(i, 1);
                    }
                meta.forEach(function(i) {
                    if (i.type == "topic" && i.id == id) i.removed = true;
                });
            }
            break;
            
        case "cp":
            delete doc.cp;
            meta.forEach(function(i) {
                if (i.type == "cp" && i.id == "cp") i.removed = true;
            });
            break;
    }

    $this.trigger("render");
    $this.trigger("save");
}
