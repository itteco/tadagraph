function(e) {
    e.stopPropagation();
    
    var $elem = $(this);
    var $$elem = $$(this);
    
    var showStarred = API.filterState["hide-unstarred"];

    if ($$elem.loading || $$elem.lastPageLoaded && !showStarred) {
        return;
    }
    
    $$elem.loading = true;
    
    $elem.trigger("showLoading");
    
    var options = $$elem.options;
    
    var DB = options.db;
    
    var firstPage = $$elem.last_key == null;
    
    
    var opts = {
        limit: getFilter().tag == 'contact' ? 40 : 10,
        descending: true,
        success: function(result) {
            renderResults(result);
        }
    }
    
    if (!firstPage) {
        opts.skip = 1;
        opts.startkey = $$elem.last_key.startkey;
        opts.startkey_docid = $$elem.last_key.startkey_docid;
    }
   
    if (showStarred) {
        delete opts.startkey;
        delete opts.endkey;
        delete opts.startkey_docid;
        delete opts.skip;
        delete opts.limit;

        API.follows.asArray(function(err, keys) {
            if (err) {
                $$elem.loading = false;
                return;
            }

            opts.keys = keys;
            opts.include_docs = true;
            DB.view('core/notifications-by-doc-id', opts);
        });
        
    } else if (!firstPage || !options.lastUnreadView) {
        DB.view(options.view.name, $.extend(true, {}, options.view.options || {}, opts));
        
    } else {
        var unreadOpts = {
            limit: 1,
            success: function(data) {
                if (data.rows.length > 0) {
                    opts.endkey = data.rows[0].key;
                    opts.endkey_docid = data.rows[0].id;
                    opts.limit = 50;
                    //delete opts["limit"];
                }
                DB.view(options.view.name, $.extend(true, {}, options.view.options || {}, opts));
            },
            error: function() {
                DB.view(options.view.name, $.extend(true, {}, options.view.options || {}, opts));
            }
        };
        DB.view(options.lastUnreadView.name, $.extend(true, {}, options.lastUnreadView.options || {}, unreadOpts));
    }
    
    function renderResults(data) {
        // TODO: could also be data.rows.length == 10 or 50.
        if (data.rows.length == 0 && !showStarred) {
            $$elem.lastPageLoaded = true;
        }
        $elem.trigger("hideLoading");
        
        if (API.videoHints) {
            if (firstPage && data.rows.length == 0) {
                $$elem.hintsVisible = true;
                API.videoHints.show();
                
            } else {
                $$elem.hintsVisible = false;
                API.videoHints.hide();
            }
        }
        
        if (data.rows.length > 0 && !showStarred) {
            $$elem.last_key = {
                startkey: data.rows[data.rows.length - 1].key,
                startkey_docid: data.rows[data.rows.length - 1].id
            };
        }
        
        var filter = $$elem.filter;

        data.rows
            .map(function(row) { 
                return row.doc || row.value; 
            })
            .filter(function(doc) {
                return filter.db.type === 'person' ||
                    !filter.db.type ||
                    options.filterCallback(doc);
            })
            .sort(function(a, b) {
                return a.created_at > b.created_at ? -1 :
                    a.created_at === b.created_at ? 0 :
                    1;
            })
            .forEach(function(doc) {
                $$elem.items[doc._id] = doc;

                if (showStarred) {
                    doc.sinceStarred = true;
                }

                API.cacheDoc(doc);
                API.filterTopics(doc, function(_error, topics) {
                    $elem.trigger("renderItem", [doc, topics]);
                });
            });
        
        $(window).trigger('widget-content-changed', [$elem, filter]);
        
        $$elem.loading = false;
        
        // Load next page if not enought items on page to show scroller.
        var $window = $(window);
        var $document = $(document);
        if ($window.scrollTop() == $document.height() - $window.height()) {
            $elem.trigger("load");
        }
    }
}