
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
    space.members = space.members || [];
    space._allMembers = space.members.map(function(m) { return m.id; });
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
    // Only for new statuses
    if (!status._rev) {
        var userDB = API.userDB();
        API.callChangesListeners(userDB, [status]);
        if (DB.uri != userDB.uri) {
            API.callChangesListeners(DB, [status]);
        }
    }

    var doStore = function() {
        var hooks = status._hooks;
        delete status._hooks;
        storeTopics(DB, status.topics, {
            doNotChangeExistingTopicTags: true,
            success: function() {
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
        
        API.registerChangesListener(DB, function(docs) {
            var reload = false;
            docs.forEach(function(doc) {
                if (doc.type == 'status' && doc.tags) {
                    var created_at = new Date(doc.created_at).getTime();
                    doc.tags.forEach(function(tag) {
                        if (!(tag in TAGS) || TAGS[tag] < created_at)
                            TAGS[tag] = created_at;
                        reload = true;
                    });
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


var TOPICS = {};
var TOPICS_LOADED = false;
var TOPICS_LISTENERS = {};
var TOPICS_WAITERS = null;

var addTopic = function(topic) {
    TOPICS[topic._id] = topic;
};

API.filterTopics = function(filter, callback, listen) {
    if (listen) {
        TOPICS_LISTENERS[listen] = callback;
    }
    if (!TOPICS_LOADED) {
        if (TOPICS_WAITERS) {
            TOPICS_WAITERS.push(callback);
            return;
        }

        TOPICS_WAITERS = [];
        TOPICS_WAITERS.push(callback);

        var DB = API.filterDB(filter);
        DB.view("core/topics", {
            include_docs: true,
            success: function(data) {
                var topics = [];
                data.rows.forEach(function(row) {
                    if (pushTopic(row.doc)) {
                        topics.push(row.doc);
                    }
                });
                data.rows.forEach(function(row) {
                    addTopic(row.doc);
                });

                TOPICS_LOADED = true;
                var waiters = TOPICS_WAITERS;
                TOPICS_WAITERS = null;
                $(document).trigger('topics-changed', [TOPICS]);
                waiters.forEach(function(callback) {
                    callback(null, TOPICS);
                });
            },
            error: function(status, error, reason) {
                $.log(status, error, reason);

                var waiters = TOPICS_WAITERS;
                TOPICS_WAITERS = true;
                waiters.forEach(function(callback) {
                    callback(error);
                });
            }
        });

        API.registerChangesListener(DB, function(docs) {
            var changed = false;
            var topics = {};
            docs.forEach(function(doc) {
                if (doc.type == 'topic') {
                    topics[doc._id] = doc;
                    addTopic(doc);
                    changed = true;
                }
            });
            if (changed) {
                $(document).trigger('topics-changed', [topics]);
                $.forIn(TOPICS_LISTENERS, function(key, callback) {
                    callback(null, TOPICS);
                });
            }
        });

    } else {
        callback(null, TOPICS);
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

// Private storage for all db changes listeners grouped by db.
var changesListenersByDB = {};

// TODO: automatically unregister listeners with same id while registering.
API.unregisterChangesListener = function(id) {
    for(var i in changesListenersByDB) {
        var listeners = changesListenersByDB[i];
        var j = 0;
        while (j < listeners.length) {
            if (listeners[j].id == id) {
                listeners.splice(j, 1);
            } else {
                j++;
            }
        }
    }
};

// Public method for changes listening.
API.registerChangesListener = function(DB, callback, id) {
    if (changesListenersByDB[DB.uri]) {
        changesListenersByDB[DB.uri].push({
            id: id || null,
            callback: callback
        });
    } else {
        changesListenersByDB[DB.uri] = [{
            id: id || null,
            callback: callback
        }];
        startWaitingForChanges(DB);
    }
};

// Private
API.callChangesListeners = function(DB, docs) {
    $(window).trigger('docs-changed', [docs]);
    // $.log("================== starting call changes listeners", db.uri, "doc
	// count:", docs.length);
    // var startime1 = +new Date;
    if (changesListenersByDB[DB.uri]) {
        var dbListeners = changesListenersByDB[DB.uri].slice(0);
        dbListeners.forEach(function(listener) {
            try {
                // var startime2 = +new Date;
                listener.callback(docs);
                /*
				 * var measured_time = +new Date - startime2; if (measured_time >
				 * 300) { $.log(listener.callback.toString(), measured_time); }
				 */
            } catch(e) {
                $.log("Error calling changes listener", e,
                      e.stack && e.stack.toString());
                API.error(e);

            }
        });
    }
    // var measured_time = +new Date - startime1;
    // $.log('================== total time:', measured_time, 'ms');
};

// Private
function startWaitingForChanges(DB) {
    DB.info({
        success: function(data) {
            setTimeout(function() {
                waitForChanges(DB, data.update_seq)
            }, 2000);
        }
    });
}

function dbListenersExist(DB) {
    return (changesListenersByDB[DB.uri] && changesListenersByDB[DB.uri].length > 0);
}

// Private
function waitForChanges(DB, last_seq, errors_count, err_id, timeout) {
    timeout = timeout || [0, 1000];

    if (errors_count > 3) {
      if (!err_id) {
        $(window).trigger('spacedb-offline');
        API.online = false;
      }
      err_id = err_id || uuid();
      $(window).trigger('couchapp-error', {
        _id: err_id,
        message: timeout[1] <= 200000 ?
                     'Oops, connection\'s lost.<br />' +
                     'Trying to re-connect soon...' :
                     'Oops, connection\'s lost.<br />' +
                     'Trying to re-connect in ' +
                     Math.round(timeout[1] / 1000) + ' sec...'
      });
    }

    // I can't understand what is that but it doesn't work on stage.
    // waitForChanges.previousListener &&
	// waitForChanges.previousListener.abort();
    // waitForChanges.previousListener =

    errors_count = errors_count || 0;

    DB.changes({
        feed: "longpoll",
        since: last_seq,
        include_docs: true,
        success: function(data) {
            if (err_id) {
              API.online = true;
              API.offlineQueue.forEach(function(fn) {
                try {
                  fn();
                } catch(e) {
                }
              });
              API.offlineQueue = [];
              $(window).trigger('spacedb-online');
              $(window).trigger('couchapp-error', {
                _id: err_id,
                hide: true
              });
            }

            var docs = data.results.map(function(seq) {
                return seq.doc;
            });
            if (docs.length > 0)
                API.callChangesListeners(DB, docs);

            if (dbListenersExist(DB)) {
                setTimeout(function() {
                    waitForChanges(DB, data["last_seq"], 0);
                }, 100);

            } else {
                delete changesListenersByDB[DB.uri];
            }
        },
        error: function(status, error, reason, textStatus) {

            if (dbListenersExist(DB)) {
                // If reason of error was 'timeout' - wait 5 minutes, else 10 s

                // 1 1
                setTimeout(function() {
                    waitForChanges(DB, last_seq, errors_count + 1, err_id,
                                   errors_count > 3 ?
                                      [timeout[1], timeout[0] + timeout[1]] :
                                      timeout);
                }, timeout[1]);

            } else {
                delete changesListenersByDB[DB.uri];
            }
        }
    });
}

})();
