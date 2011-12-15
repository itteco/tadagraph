function(page, match, widgets, filter) {
    var docId = match[1];
    
    var intId = false;
    if (docId.match(/^\d+$/)) {
        intId = parseInt(docId);
        docId = API.filterId(filter) + '-' + intId;
    }
    
    if (docId in API.cachedDocs) {
        setTitle(API.cachedDocs[docId]);
        
    } else {
        API.setTitle(filter);
    }
    
    var $status = $('#id_inline_form');
    $('body').append($status);
    
    page.trigger('doc', []);
    widgets.docsTree.html("");
    widgets.bigLoader.trigger('showLoading');
    
    $('#id_inline_form').hide();
    
    var DB = API.filterDB(filter);
    
    function error404() {
        // TODO: make nicer error.
        alert('Document not found');
    }
    
    var success = function(data) {
        widgets.bigLoader.trigger('hideLoading');
        var doc = null;
        var children = [];
        data.rows.forEach(function(row) {
            if (row.doc._id == docId) {
                doc = row.doc;
            } else {
                children.push(row.doc);
            }
        });

        if (!doc) {
            error404();
            return;
        }

        $.extend(filter, {
            parent: doc, 
            view: 'details'
        });

        setFilter(filter);

        setTitle(doc);
        
        page.trigger('doc', [doc]);
        widgets.docsTree.trigger('setDocuments', [{
            root: doc,
            docs: children,
            filter: function(adoc) {
                var cursor = adoc;
                while (cursor.parent && cursor.parent._id != doc._id) {
                    cursor = cursor.parent;
                }

                return cursor.parent && cursor.parent._id == doc._id;
            },
            formInitCallback: function(form) {
                form.trigger('reply', [doc, {
                    doNotFocus: true, 
                    doNotShowReceiver: true
                }]);
            }
        }]);
    };
    
    function loadDocTree() {
        DB.view('core/doc-with-children', {
            key: docId,
            include_docs: true,
            success: success
        });
    }
    
    if (intId) {
        DB.view('core/doc-by-custom-id', {
            key: ['intId', filter.db.type, filter.db.name, intId], // TODO: hide db
            success: function(data) {
                if (data.rows.length > 0) {
                    docId = data.rows[0].id;
                    loadDocTree();
                } else {
                    error404();
                }
            }
        });
    } else {
        loadDocTree();
    }
    
    function setTitle(doc) {
        // Extract title from first embed
        if (doc.embedded) {
            var preview = doc.embedded[0].preview;
            if (preview && preview.title) {
                API.setTitle(preview.title);
                return;
            }
        }
        
        // Get title from doc.
        API.setTitle(API.filterPrepare({parent: doc}));
    }
}
