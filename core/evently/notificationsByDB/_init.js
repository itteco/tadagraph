function(e, options) {
    e.stopPropagation();
    
    extractWidgetFunctions(this);

    var $this = $(this);
    var $$this = $$(this);
    
    $$this.items = [];
    $$this.options = options;
    $$this.last_key = null;
    $$this.loading = false;
    $$this.filter = $.extend(true, {}, getFilter());
    $$this.lastPageLoaded = false;
                              
    $this.trigger("load");
    
    // TODO: if this get message before first page could be message repeating.
    
    $(window).bind('docs-changed', function(e, docs) {
        docs.forEach(function(doc) {
            // Filter docs of this view.
            if (!doc._deleted && (!options.filterCallback || options.filterCallback(doc))) {
                if (!doc._rev) {
                    API.filterTopics(doc, function(_error, topics) {
                        $this.trigger("renderNew", [doc, topics]);
                        $(window).trigger('widget-content-changed', [$this, doc]);
                    });
                    return;
                }
                
                API.cacheDoc(doc);
                
                // If doc not loaded yet.
                if (!($$this.items[doc._id])) {
                    
                    // Detect if doc older then last loaded doc.
                    var outOfViewDoc = false;
                    if ($$this.last_key) {
                        var last_docid = $$this.last_key.startkey_docid;
                        var lastDoc = $$this.items[last_docid];
                        if (lastDoc.created_at > doc.created_at) {
                            outOfViewDoc = true;
                        }
                    }
                    
                    if (!outOfViewDoc) {
                        API.filterTopics(doc, function(_error, topics) {
                            $this.trigger("renderNew", [doc, topics]);
                            $(window).trigger('widget-content-changed', [$this, doc]);
                        });
                        //console.log('newNotification -1', +new Date - x);
                        
                        //var x = +new Date;
                        if (API.videoHints) {
                            API.videoHints.hide();
                            $$this.hintsVisible = false;
                        }
                        //console.log('datasetFilled', +new Date - x);
                    }
                    
                } else {
                    API.filterTopics(doc, function(_error, topics) {                     
                        $this.trigger("renderNew", [doc, topics]);
                        $(window).trigger('widget-content-changed', [$this, doc]);
                    });
                    //console.log('newNotification - 2', +new Date - x);
                }
            }
            
            if (doc._deleted && doc._id && $$this.items[doc._id]) {
                $.log("removing", doc._id);
                var $item = $('li.item[data-id="' + doc._id + '"]', $this);
                $item.css('background-color', '#fffcd8');
                $item.slideUp(250, function(){
                    $item.remove();
                });
            }
        });
    });
    
    $('.flow .item', this).live('mouseenter mouseleave', function(event) {
        $(this).toggleClass('state-hover', event.type == 'mouseenter');
    });

    $("#id_thread_preview").trigger("registerItems", [$(".flow .item", this)]);
    
    var $window = $(window);
    var $document = $(document);
    $window.scroll(function(){
        if ($this.is(":visible") && !API.filterState["hide-unstarred"]) {
            if  ($window.scrollTop() == $document.height() - $window.height()) {
                if ($$this.loading || $$this.lastPageLoaded) {
                    return;
                }
                $this.trigger("load"); 
            }
        }
    });
    
//    
//    var userDB = API.userDB();
//
//    // Load offline docs
//    var bulk = {};
//    var hooks = {};
//    $$().all().filter(function(pair) {
//        return /^offline_doc-/.test(pair.key) &&
//        pair.value.created_by && 
//        (pair.value.created_by.id == API.username() ||
//            pair.value.created_by.nickname == API.username());
//    }).forEach(function(pair) {
//        var doc = pair.value;
////        API.callChangesListeners(userDB, [doc]);
//      
//        // Create bulk queue for that docs
//        if (doc._id) {
//            var DB = API.filterDB({parent: doc});
//            bulk[DB.uri] = bulk[DB.uri] || {
//                db: DB,
//                docs: []
//            };
//            hooks[doc._id] = doc._hooks;
//            delete doc._hooks;
//            bulk[DB.uri].docs.push(doc);
//        }
//    });
//    
//    // Save all docs from bulk queue (ignore conflicts and any errors)
//    for (var i in bulk) {
//        if (!bulk.hasOwnProperty(i)) continue;
//      
//        (function(i, bulk) {
//            bulk.db.bulkSave(bulk.docs, {
//                success: function(data) {
//                    data.forEach(function(res, i) {
//                        var doc = bulk.docs[i];
//                        if (res.rev) {
//                            var docHooks = hooks[res.id];
//                            if (docHooks && 'post-store' in docHooks) {
//                                docHooks['post-store'].forEach(function(hook) {
//                                    hook(doc);
//                                });
//                            }
//                            doc._rev = res.rev;
//                        } else {
//                            // If update conflict/error - mark as deleted. Changes listener will delete in from offline storage.
//                            doc._deleted = true;
//                        }
//                    });
//                    API.callChangesListeners(userDB, bulk.docs);
//                },
//                error: function() {}
//            });
//        })(i, bulk[i]); 
//    }
}
