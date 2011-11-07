
(function() {

var RESOURCE_URI = 'http://tadagraf.com';

var dbName;
var space;
var username=null;

var request = function(method, url, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    options = options || {};
    
    var contentType = options.contentType;
    var content = options.content;
    if (typeof content === 'object') {
        content = JSON.stringify(content);
        contentType = contentType || "application/json";
    }
    
    $.ajax({
        type: method,
        url: url,
        dataType: 'json',
        contentType: contentType,
        data: content,
        success: function(resp, status, req) {
            if (req.status == 200) {
                callback(undefined, resp);

            } else {
                callback(resp);
            }
        },
        error: function(req, text) {
            callback({error: true, reason: text});
        }
    });
};

var filterDBURI = function() {
    if (!dbName) {
        var path = document.location.pathname;
        dbName = path.match(/\/(.*)\/_design\//)[1];
    }
    return "/" + encodeURIComponent(dbName) + "/"
};

var loadSpace = function() {
    API.username();

    space = APPS.core.ddoc.space;
    space.member = space.member || [];
    space.allMembers = space.member || [];
};

if (!window.API){
	
	window.API ={};
}

API.avatarUrl = function(uid, size) {
    return '/_users/org.couchdb.user%3A' + uid + '/avatar';
}

API.commonDB = function() {
    return API.filterDB();
};

API.commonDBURI = function() {
    return filterDBURI();
};

API.changesFilter = "core/generic-changes";

API.filterByPath = function(path, callback) {
    var s = {type: space.type, name: space.id};
    callback({db: s}, path); // TODO: hide db
};

API.filterDB = function(filter) {
    filter = API.filterPrepare(filter);
    var space = filter.db; // TODO: hide this
    var dbUri = filterDBURI(filter);
    if (space && space.type && space.name) {
        return $.couch.db(dbName, $.extend({uri: dbUri}, space));
        
    } else {
        return $.couch.db(dbName, {uri: dbUri, name: username, type: 'person'});
    }
};

API.filterId = function() {
    return "default";
};

API.filterPrefix = function(filter) {
    return '';
};

API.filterPrepare = function(filter) {
    if (!filter)
        filter = {};

    filter.topicId      = filter.topicId || "";
    filter.tag          = filter.tag || "";
    filter.nickname     = filter.nickname || "";
    filter.parentId     = filter.parentId || "";
    filter.view         = filter.view || "";

    // Default is user db.
    filter.db = filter.db || {type: "", name: ""}; // TODO: hide db

    if (filter.topic) {
        filter.topicId = filter.topic._id;
        filter.db = filter.topic.db || filter.db;
    }

    if (filter.parent) {
        filter.db = filter.parent.db;
        filter.parentId = filter.parent._id;
    }

    if (filter.parentId && !filter.view) {
        filter.view = "details";
    }

    return filter;
};

API.filterSpace = function() {
    if (!space) loadSpace();
    return space;
};

API.filterSpaceName = function(filter) {
    return "Default";
};

API.filterSpaces = function(filter, callback) {
    if (typeof filter === 'function') {
        callback = filter;
        filter = null;
    }
    
    if (!space) loadSpace();
    
    API.username(function() {
        callback && callback([space]);
    });
};

API.filterValid = function(filter, appName) {
    return true;
};

API.flowKey = function(filter) {
    var topicId = filter.topicId || '';
    var tag = filter.tag || '';
    var nickname = filter.nickname || API.filterState['hide-others'] && (API.filterState['hide-others-list'] || API.username()) || '';
    var parentId = filter.parentId || '';
    return 'flow-' + topicId + '-' + parentId + '-' + tag + '-' + nickname;
};

API.forEachApp = function(filter, callback) {
    for (var appName in APPS) {
       if (APPS.hasOwnProperty(appName)) {
            callback(APPS[appName], appName);
       }
    }
};

API.getMenuItemFilters = function(item) {
    var filters = item.filters || {};
    return filters;
};

var MENU;
API.getMenu = function() {
    if (!MENU) {
        function filterItem(item) {
            if (item.disabled)
                return false;

            if (typeof item.orderIndex != 'number' || !item.title || !item.id) {
                $.log("error: menu-items/" + item.id + ".json must have all fields: orderIndex, title, id");
                return false;
            }

            return true;
        }
        var itemsDict = {};
        forEachApp(function(app) {
            var menuItems = app.ddoc["menu-items"];
            if (menuItems) {
                for (var id in menuItems) {
                    var item = menuItems[id];
                    if (typeof item.title == 'string') {
                        if (item.title.match(/^function\b/)) {
                            item.title = eval("var __f = " + item.title + ";\n__f")
                        } else {
                            (function(title) {
                                item.title = function() {return title;}
                            })(item.title);
                        }
                    }

                    if (id in itemsDict) {
                        $.extend(true, itemsDict[id], item);
                        
                    } else {
                        itemsDict[id] = item;
                    }
                }
            }
        });

        var items = [];
        for (var id in itemsDict) {
            var item = itemsDict[id];
            if (filterItem(item))
                items.push(item);
        }
        
        items.sort(function(a, b) {
            if (a.orderIndex != b.orderIndex) {
                if (a.orderIndex > b.orderIndex)
                    return 1;
                else
                    return -1;
            }
            return 0;
        });
        
        MENU = items;
    }
    return MENU;
};

var TOPIC_TAGS;
API.getTopicTags = function(filter) {
    if (!TOPIC_TAGS) {
        var TAGS = [];
        API.getMenu(filter).forEach(function(appMenu) {
            if (appMenu.topicTag && appMenu.topicTag.tag)
                TAGS.push(appMenu.topicTag.tag);
        });
        TOPIC_TAGS = TAGS;
    }
    return TOPIC_TAGS;
};

API.isAppEnable = function(appName, filter) {
    return true;
};

API.log = function(severity, message) {};

API.normalizeFilter = function(filter, callback) {
    callback();
};

API.profile = function(uid, callback) {
    if (typeof uid === 'function') {
        callback = uid;
        uid = null;
    }
    uid = uid || API.username();
    
    var p = uid? {id: uid, nickname: uid, email: []}: undefined;
    if (callback) callback(p);
    return p;
};

API.resourceURI = RESOURCE_URI;

API.setTitle = function(title) {
    if (typeof title === 'object') {
        if (title.application) {
            title = title.application + ' - ' + API.setTitle.original;

        } else if (title.parent) {
            title = API.trimDocBody(title.parent);

        } else if (title.topic) {
            title = '[' + title.topic.title + '] - ' + API.setTitle.original;

        } else {
            title = API.setTitle.original;
        }
    }

    if (!title) {
        title = API.setTitle.original;
    }

    document.title = title;
};

API.storeStatus = function(DB, status, options) {
    var notification = generateNotification({
        ref: status,
        privacy: status.privacy
    });

    // Only for new statuses
    if (!status._rev) {
        var userDB = API.userDB();
        callChangesListeners(userDB, [status, notification]);
        if (DB.uri != userDB.uri) {
            callChangesListeners(DB, [status, notification]);
        }
    }

    var doStore = function() {
        var hooks = status._hooks;
        delete status._hooks;
        storeTopics(DB, status.topics, {
            success: function() {
                // Save log about new tada.
                API.logEvent && API.logEvent(LogLevel.INFO, "Tada");

                if (hooks && 'pre-store' in hooks) {
                    hooks['pre-store'].forEach(function(hook) {
                        hook(status);
                    });
                }
                DB.saveDoc(status, {
                    success: function(data) {
                        if (hooks && 'post-store' in hooks) {
                            hooks['post-store'].forEach(function(hook) {
                                hook(status);
                            });
                        }
                        if (!options.withoutNotify) {

                            DB.saveDoc(notification, {
                                success: function() {

                                    if (options.success)
                                        options.success();
                                },
                                error: function(status, error, reason) {
                                    if (options.error)
                                        options.error(status, error, reason);
                                    else
                                        throw new Error("submitForm, save status notification error: " + status + ": " + error + ": " + reason);
                                }
                            });

                        } else {
                            if (options.success)
                                options.success();
                        }
                    },
                    error: function(status, error, reason) {
                        $.log("save status", status, error, reason);
                        if (options.error)
                            options.error(status, error, reason);
                        else
                            throw "submitForm, save status error: " + status + ": " + error + ": " + reason;
                    }
                });
            },
            error: function(status, error, reason) {
                if (options.error)
                    options.error(status, error, reason);
                else
                    throw "submitForm, save status error: " + status + ": " + error + ": " + reason;
            }
        });
    };

    doStore();
};

var TAGS;
var TAGS_ITEMS;
var TAGS_LISTENERS = {};
var TAGS_LOCK = false;
var TAGS_WAITERS = [];
API.filterTags = function(filter, callback, listen) {
    if (listen) {
        TAGS_LISTENERS[listen] = callback;
    }
    if (!TAGS) {
        if (TAGS_LOCK) {
            TAGS_WAITERS.push(callback);
            return;
        }
        
        TAGS_LOCK = true;
        TAGS_WAITERS.push(callback);
        
        var DB = API.userDB();
        DB.view("core/tags", {
            group: true,
            success: function(data) {
                var tags = {}
                data.rows.forEach(function(row) {
                    var tag = row.key;
                    var created_at = row.value;
                    if (!(tag in tags) || tags[tag] < created_at)
                        tags[tag] = created_at;
                });
                
                var items = [];
                for (var tag in tags) {
                    items.push({
                        tag: tag,
                        last_used_at: tags[tag]
                    })
                }
                
                TAGS = tags;
                TAGS_ITEMS = items;
                TAGS_LOCK = false;
                TAGS_WAITERS.forEach(function(callback) {
                    callback(undefined, TAGS_ITEMS);
                });
                TAGS_WAITERS = undefined;
            },
            error: function(status, error, reason) {
                $.log(status, error, reason);
                
                TAGS = {};
                TAGS_ITEMS = [];
                TAGS_LOCK = false;
                TAGS_WAITERS.forEach(function(callback) {
                    callback(error);
                });
                TAGS_WAITERS = undefined;
            }
        });
        
        registerChangesListener(DB, function(docs) {
            var reload = false;
            docs.forEach(function(doc) {
                if (doc.type == 'notification') {
                    if (doc.ref.tags) {
                        var created_at = new Date(doc.created_at).getTime();
                        doc.ref.tags.forEach(function(tag) {
                            if (!(tag in TAGS) || TAGS[tag] < created_at)
                                TAGS[tag] = created_at;
                            reload = true;
                        });
                    }
                }
            });
            if (reload) {
                var items = [];
                for (var tag in TAGS) {
                    items.push({
                        tag: tag,
                        last_used_at: TAGS[tag]
                    })
                }
                TAGS_ITEMS = items;
                $.forIn(TAGS_LISTENERS, function(key, callback) {
                    callback(undefined, TAGS_ITEMS);
                });
            }
        });

        
    } else {
        callback(undefined, TAGS_ITEMS);
    }
};
API.trumbUrl = function(url, size) {
    return url;
};

API.userDB = function() {
    return API.filterDB({db: {name: username, type: 'person'}}); // TODO: hide db
};

API.username = function(callback) {
    if (username) {
       if (callback){callback(undefined, username);}
        
    } else {
        request("GET", "/_session", function(error, data) {
            username = data.userCtx.name || "anonymous";
            if (callback){callback(error, username);}
        });
    }
    return username;
};

})();
