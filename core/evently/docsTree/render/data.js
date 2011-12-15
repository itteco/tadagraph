function(e, newItemsIds) {
    e.stopPropagation();
    
    // Move status form away.
    if ($("#id_inline_form", this).length == 1) {
        $('body').append($('#id_inline_form').hide());
    }
    
    newItemsIds = newItemsIds || [];
    
    var items = $$(this).items;
    var docs = [];
    
    for(var i in items) {
        docs.push(items[i]);
    }
    
    // Sort docs by time.
    docs.sort(function(a, b) {
        if (a.created_at != b.created_at) {
            if (a.created_at > b.created_at)
                return 1;
            else
                return -1;
        }
        return 0;
    });
    
    // Extract index length to build something like "002".
    var l = (docs.length + "").length;
    
    var tree = {};
    var treeList = [];
    
    // Build dictionary with meta data.
    docs.forEach(function(doc, i) {
        tree[doc._id] = {
            sourceIndex: formatInt(l, i),
            index: formatInt(l, i),
            level: 0,
            id: doc._id,
            doc: doc,
            isNew: newItemsIds[doc._id] && doc._rev,            
            offline: !doc._rev
        };
        treeList.push(tree[doc._id]);
    });
    
    // Build indexes like "001-012-003".
    for(var i in tree) {
        var item = tree[i];
        var parent = item.doc.parent;
        while (parent && tree[parent._id]) {
            item.index = tree[parent._id].sourceIndex + '-' + item.index;
            parent = parent.parent;
            if (item.level < 4)
                item.level += 1;
        }
    }
    
    // Order list by indexes.
    treeList.sort(function(a, b) {
        if (a.index != b.index) {
            if (a.index > b.index)
                return 1;
            else
                return -1;
        }
        return 0;
    });
    
    // Index formatter.
    function formatInt(length, value) {
        var result = value + '';
        while (result.length < length) {
            result = "0" + result;
        }
        return result;
    }

    return {items: treeList};
}
