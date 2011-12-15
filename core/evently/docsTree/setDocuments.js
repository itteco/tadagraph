function(e, options) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    var docs = options.docs;
    var filter = options.filter;
    $$this.formInitCallback = options.formInitCallback;
    $$this.root = options.root;
    
    var items = $$this.items;
    for(var i in items) {
        delete items[i];
    }
    
    docs.forEach(function(doc) {
        items[doc._id] = doc;
        API.cacheDoc(doc);
    });
    
    $this.trigger("render");
    
    var DB = API.filterDB(getFilter());
    API.unregisterChangesListener("new project document childs");
    API.registerChangesListener(DB, function(docs) {
        // Check if page alive.
        if ($this.is(":visible")) {
            var changed = false;
            var newItemsIds = []
            docs.forEach(function(doc) {
                if (filter(doc)) {
                    items[doc._id] = doc;
                    newItemsIds[doc._id] = true;
                    API.cacheDoc(doc);
                    changed = true;
                }
                if (doc._deleted && doc._id && items[doc._id]) {
                    delete items[doc._id];
                    changed = true;
                }
            });
            if (changed) {
                $this.trigger("render", [newItemsIds]);
            }
        }
    }, "new project document childs");
}
