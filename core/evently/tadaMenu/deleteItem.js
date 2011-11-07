function(e, $item) {
    e.stopPropagation();
    
    var id = $item.data("id");
    if (!API.cachedDocs[id]) {
        // self is not expected error.
        return false; 
    }
    
    var doc = API.cachedDocs[id];
    
    if (doc.type == "notification") {
        doc = doc.ref;
    }
    
    var $loader = $item.find('.editor-loader');
    if ($loader.length == 0) {
        $item.append('<div class="editor-loader"></div>');
        $loader = $item.find('.editor-loader');
    }
    
    $item.addClass('state-progress');
    $loader.show();
    
    var DB = API.filterDB({parent: doc});
    DB.view("core/docs-to-delete", {
        key: doc._id,
        include_docs: true,
        success: function(data) {
            var origDoc;
            var notifyDoc;
            var hasChildren = false;
            data.rows.forEach(function(row) {
                var d = row.doc;
                if (d._id == doc._id) {
                    origDoc = doc;
                
                } else if (d.type && d.type == "notification") {
                    notifyDoc = d;
                
                } else
                    hasChildren = true;
            });

            if (hasChildren) {
                $item.removeClass('state-progress');
                $loader.hide();
                alert("Can't delete message which got replies to it. Please, try editing instead.");

            } else {
                DB.saveDoc(notifyDoc, { // TODO: workaround for viewed_at
                    success: function() {
                        var docs = [];
                        if (origDoc) {
                            origDoc._deleted = true;
                            docs.push(origDoc)
                        }
                        notifyDoc._deleted = true;
                        docs.push(notifyDoc);
                        DB.bulkSave(docs, {
                            success: function() {
                                $item.fadeOut('fast');
                            }
                        });
                    }
                });
            }
        }
    });
}
