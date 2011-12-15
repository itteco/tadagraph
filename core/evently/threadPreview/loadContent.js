function(e, options) {
    var doc = API.cachedDocs[options.id];
    
    var root = doc;
    while(root.parent) {
        root = root.parent;
    }
    
    options.setRootUrl(getUrlByFilter({parent: root}));
    
    var DB = API.filterDB({parent: doc});
    DB.view("core/doc-with-children", {
        key: root._id,
        include_docs: true,
        success: function(data) {
            var docs = [];
            data.rows.forEach(function(row) {
                var doc = row.doc;
                doc.created_at = API.parseDate(doc.created_at);
                docs.push(doc);
            });
            
            docs.sort(function(a, b) {
                if (a.created_at != b.created_at) {
                    if (a.created_at > b.created_at)
                        return 1;
                    else
                        return -1;
                }
                return 0;
            });
            
            var html = "";
            docs.forEach(function(doc) {
                var trimmedBody = trimMeta(doc.body);
                if (trimmedBody.length == 0) {
                    trimmedBody = doc.body;
                }
                if (trimmedBody.length > 230) {
                    trimmedBody = trimmedBody.substr(0, 230) + "...";
                }
                
                html += '<li class="item">';
                html += '<img src="' + API.avatarUrl(doc.created_by.id) + '" class="avatar" alt="" data-id="' + doc.created_by.id + '" title="' + doc.created_by.nickname + '" onerror="defaultAvatar(event)"/>';
                html += '<div class="text">';
                html += trimmedBody;
                html += '</div></li>';
            });
            options.callback(html);
        }
    });
    
}