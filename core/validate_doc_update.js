function(newDoc, oldDoc, userCtx) {
    function require(field, doc) {
        if (!doc)
            doc = newDoc;
        var message = "Document must have a " + field;
        if (typeof doc[field] == "undefined" ||
            (typeof doc[field] == "string" && doc[field] == ""))
            throw({forbidden : message});
    }
    
    if (newDoc && oldDoc && (oldDoc.intId || newDoc.intId)) {
        if (!newDoc.intId)
            throw {forbidden: "Deleting intId field forbidden"};
        if (oldDoc.intId && oldDoc.intId != newDoc.intId)
            throw {forbidden: "Changing intId field forbidden"};
    }
    
    if (userCtx.roles.indexOf('admin') == -1 && userCtx.roles.indexOf('_admin') == -1 && userCtx.roles.indexOf('owner') == -1) {
        if (newDoc.tags && newDoc.tags.indexOf("public") > -1) {
            if (!oldDoc || !oldDoc.tags || oldDoc.tags.indexOf("public") == -1) {
                // Check add "publish" tag.
                throw {forbidden: "Only admin can add 'public' tag"};
            }
        } else if (oldDoc && oldDoc.tags && oldDoc.tags.indexOf("public") > -1) {
            if (!newDoc.tags || newDoc.tags.indexOf("public") == -1) {
                // Check remove "publish" tag.
                throw {forbidden: "Only admin can remove 'public' tag"};
            }
        }
    }
    
    if (!newDoc.type && !newDoc._deleted) {
    
        throw {forbidden: "Document must have type"};
        
    } else if (newDoc.type == "topic") {
        if (newDoc.ver == 1) {
            require("db");
            require("name", newDoc.db);
            require("type", newDoc.db);
            require("created_at");
            require("created_by");
            require("id", newDoc.created_by);
            require("nickname", newDoc.created_by);
            require("title");
        } else {
           throw {forbidden: "Unsupported topic schema version"};
        }
    } else if (newDoc.type == "notification") {
    
        if (oldDoc) {
            // For now.
            //throw {forbidden: "Notification can't be updated"};
        }
        
        if (!newDoc.ver) {
            require("db");
            require("name", newDoc.db);
            require("type", newDoc.db);
            require("ref");
            require("created_at");
            require("created_by");
            require("body");
        } else if (newDoc.ver == 1) {
            require("db");
            require("name", newDoc.db);
            require("type", newDoc.db);
            require("ref");
            require("created_at");
            require("created_by");
            require("id", newDoc.created_by);
            require("nickname", newDoc.created_by);
            require("body");
        } else {
           throw {forbidden: "Unsupported notification schema version"};
        }
        
     // TODO separate push
     } else if (newDoc.type == "status" || newDoc.type == "push") {
        
        // TODO: security hole (need for modify due field)
//        if (oldDoc) {
            // For now.
//            throw {forbidden: "Status can't be updated"};
//        }
        
        if (!newDoc.ver) {
            require("db");
            require("name", newDoc.db);
            require("type", newDoc.db);
            require("created_at");
            require("created_by");
            require("body");
        } else if (newDoc.ver == 1) {
            require("db");
            require("name", newDoc.db);
            require("type", newDoc.db);
            require("created_at");
            require("created_by");
            require("id", newDoc.created_by);
            require("nickname", newDoc.created_by);
            require("body");
        } else {
           throw {forbidden: "Unsupported status schema version"};
        }
        
    } else if (newDoc.type == "log") {
        if (oldDoc) {
            // For now.
            throw {forbidden: "Log can't be updated"};
        }
        
        if (newDoc.ver == 1) {
            require("db");
            require("name", newDoc.db);
            require("type", newDoc.db);
            require("created_at");
        } else if (newDoc.ver == 2) {
            require("db");
            require("name", newDoc.db);
            require("type", newDoc.db);
            require("created_at");
            require("level");
            require("message");
        } else {
           throw {forbidden: "Unsupported log schema version"};
        }
    
    } else if (newDoc.type == "follow") {
        if (oldDoc) {
            // For now.
            throw {forbidden: "Follow info can't be updated"};
        }
        
        if (newDoc.ver == 1) {
            require("db");
            require("name", newDoc.db);
            require("type", newDoc.db);
            require("created_at");
            require("ref");
            require("_id", newDoc.ref);
        } else {
           throw {forbidden: "Unsupported follow info schema version"};
        }
    
    } else if (newDoc.type == "id-acquire") {
    
    } else if (newDoc.type == 'user-storage-property') {
      require('key');
      require('value');
      require('version');
    } else if (newDoc._deleted) {
        if (userCtx.roles.indexOf('_admin') !== -1) {
            return;

        } else if (oldDoc && oldDoc.type) {
            if (oldDoc.type == "topic") {
                throw {forbidden: "Can't detele topic"};

            } else if (oldDoc.type == "notification") {
                if (userCtx.name && userCtx.name != oldDoc.ref.created_by.id)
                    throw {forbidden: "Only (" + oldDoc.created_by.id + ") " + oldDoc.created_by.nickname + " can delete this notification"};

            } else if (oldDoc.type == "status") {
                if (userCtx.name && userCtx.name != oldDoc.created_by.id)
                    throw {forbidden: "Only (" + oldDoc.created_by.id + ") " + oldDoc.created_by.nickname + " can delete this status"};

            } else if (oldDoc.type == "todo") {
                if (userCtx.name && userCtx.name != oldDoc.created_by.id)
                    throw {forbidden: "Only (" + oldDoc.created_by.id + ") " + oldDoc.created_by.nickname + " can delete this todo"};

            } else if (oldDoc.type == "log") {
                throw {forbidden: "Can't detele log"};

            } else if (oldDoc.type == "follow") {
                if (userCtx.name && userCtx.name != oldDoc.db.name)
                    throw {forbidden: "Only user with id=" + oldDoc.db.name + " can delete this follow info"};
            }
            
        } else {
            throw {forbidden: "You cannot delete this document"};
        }
    
    } else {
    
        // Check wrong document types.
        
        // !json allowed_doc_types
        var doc_type_found = false;
        for(var i in allowed_doc_types) {
            if (allowed_doc_types[i] == newDoc.type) {
                doc_type_found = true;
            }
        }
        if (!doc_type_found)
            throw {forbidden: "Unsupported document type " + newDoc.type};
    }
}
