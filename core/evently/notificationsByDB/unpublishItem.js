function(e, $item) {
    $.log("unpublishItem", $item);
    e.stopPropagation();
    
    var id = $item.data("id");
    if (!API.cachedDocs[id]) {
        // self is not expected error.
        return; 
    }
    
    var doc = API.cachedDocs[id];
    var DB = API.filterDB({parent: doc});
    DB.openDoc(doc.ref._id, {
        success: function(doc) {
            var tagsDesc = API.tags.desc(API.filterPrepare({parent: doc}));
            doc.tags = API.tags.remove("public", doc.tags || [], tagsDesc, function(tag, remove) {
                API.tags.handle(tag, doc, remove? "remove": "add", tagsDesc);
            });

            storeStatusAndUpdateNotifications(DB, doc, {
                success: function() {
                },
                error: function() {
                    // TODO: rollback visuals.
                }
            });
        }
    });
}
