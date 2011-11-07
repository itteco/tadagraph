function(e) {
    e.stopPropagation();
    
    var $$this = $$(this);
    
    var doc = $$this.doc;
    
    if ($$this.options.save) {
        $$this.options.save(doc);
        
    } else {
        var DB = API.filterDB({parent: doc});
        storeStatusAndUpdateNotifications(DB, doc, {
            success: function() {
            },
            error: function(status, error, reason) {
                $.log(status, error, reason);
            }
        });
    }
}
