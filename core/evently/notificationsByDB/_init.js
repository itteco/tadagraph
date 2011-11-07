function(e, options) {
    e.stopPropagation();
    
    extractWidgetFunctions(this);

    var $this = $(this);
    var $$this = $$(this);
    
    $$this.items = [];
    $$this.options = options;
    $$this.last_key = null;
    $$this.newUnviewedItems = [];
    $$this.loading = false;
    $$this.filter = $.extend(true, {}, getFilter());
    $$this.lastPageLoaded = false;
                              
    $this.trigger("load");
    
    // TODO: if this get message before first page could be message repeating.
    
    registerChangesListener(options.db, function(docs) {
        var docsToMarkView = [];
        docs.forEach(function(doc) {
            if (!doc._rev) {
                $$().set('offline_doc-' + doc._id, doc, true);
            } else {
                $$().del('offline_doc-' + doc._id, true);
            }
        
            // Filter docs of this view.
            if (!doc._deleted && (!options.filterCallback || options.filterCallback(doc))) {
                if (!doc._rev) {
                  $this.trigger("renderNew", [doc]);                
                  return;
                }
                
                API.cacheDoc(doc);
                API.cacheDoc(doc.ref);
                
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
                        // If doc not viewed - mark viewed.
                        if (API.isViewed && !API.isViewed(doc)) {
                            if ($this.is(":visible")) {
                                docsToMarkView.push(doc);
                                
                            } else {
                                $$this.newUnviewedItems.push(doc);
                            }
                        }
                       //var x = +new Date;                        
                        $this.trigger("renderNew", [doc]);
                        //console.log('newNotification -1', +new Date - x);
                        
                        //var x = +new Date;
                        if (API.videoHints) {
                            API.videoHints.hide();
                            $$this.hintsVisible = false;
                        }
                        //console.log('datasetFilled', +new Date - x);
                    }
                    
                } else {
                    //var x = +new Date;                        
                    $this.trigger("renderNew", [doc]);
                    //console.log('newNotification - 2', +new Date - x);
                }
            }
            
            if (doc._deleted && doc._id && $$this.items[doc._id]) {
                $.log("removing", doc._id);
                var $item = $('li.item[data-id="' + doc._id + '"]', $this);
                $item.css('background-color','#fffcd8');
                $item.slideUp(250, function(){
                    $item.remove();
                });
            }
        });
    });
    
    $('.flow .item', this).live('mouseenter mouseleave', function(event) {
        if (event.type == 'mouseenter') {
            $(this).addClass('state-hover');
        } else {
            $(this).removeClass('state-hover');
        }
    });

    $('.stream .item.clickable a', this).live('click', function(e) {
        e.stopPropagation();
    });

    $('.stream .item.clickable', this).live('click', function() {
        if ($(this).data('url') && !$(this).hasClass('disabled')) {
            window.location.href = $(this).data('url');
        }
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
    
    
    var userDB = API.userDB();

    // Load offline docs
    var bulk = {};
    $$().all().filter(function(pair) {
        return /^offline_doc-/.test(pair.key) &&
        pair.value.created_by && 
        (pair.value.created_by.id == API.username() ||
            pair.value.created_by.nickname == API.username());
    }).forEach(function(pair) {
        var doc = pair.value;
        callChangesListeners(userDB, [doc]);
      
        // Create bulk queue for that docs
        if (doc._id) {
            var DB = API.filterDB({parent: doc});
            bulk[DB.uri] = bulk[DB.uri] || {
                db: DB,
                docs: []
            };
            bulk[DB.uri].docs.push(doc);
        }
    });
    
    // Save all docs from bulk queue (ignore conflicts and any errors)
    for (var i in bulk) {
        if (!bulk.hasOwnProperty(i)) continue;
      
        (function(i, bulk) {
            bulk.db.bulkSave(bulk.docs, {
                success: function() {
                    callChangesListeners(userDB, bulk.docs.map(function(doc) {
                        if (doc.type == 'notification') {
                            doc.viewed_at = new Date();
                        }
                        doc._rev = 'saved';
                        return doc;
                    }));
                },
                error: function() {}
            });
        })(i, bulk[i]); 
    }
}
