function(e, doc, property, oldValue, newValue) {
    e.stopPropagation();
//    $.log(JSON.stringify(new Date()), "doc-changes", doc, property, oldValue, newValue);
    
    if (property == "owner") {
        
    } else if (property == "_ticket-status") {
        var ALLOWED_STATUSES = ["cancelled", "delivered", "finished"];
        if (ALLOWED_STATUSES.indexOf(newValue) > -1) {
            var profile = API.profile();

            var DB = API.filterDB({parent: doc});
            createStatus(DB, "#" + newValue, profile, {parent: doc}, function(status) {
                status.type = "status";
                status.tags = [newValue, "changes"];
//                status.privacy = "owners";
                API.storeStatus(DB, status, {
                    withoutNotify: false
                });
            });
           
        }
    } 
}
