function(e, $item) {
    var $$this = $$(this);
    
    e.stopPropagation();
    
    var id = $item.data("id");
    if (!API.cachedDocs[id]) {
        // self is not expected error.
        return; 
    }
    
    if ($$this.metaEditor) {
        $$this.metaEditor.close();
        delete $$this.metaEditor;
    }
    
    var metaEditor = {};
    metaEditor.open = function($item, doc) {
        var $ui = metaEditor.$ui = $('<div class="editor editor-meta">');
        metaEditor.$item = $item;

        $item.find('.item-context, .button.star, .col.content ul.meta').hide();
        $item.addClass('state-active');
        $item.append($ui);
        $$($item).editor = metaEditor;

        $ui.evently("itemMetaEditor", APPS.core, [{
                doc: doc,
                close: function() {
                    metaEditor.close();
                }
        }]);
    }
    metaEditor.close = function() {
        var $ui = metaEditor.$ui;
        var $item = metaEditor.$item;
        
        if ($ui) {
            $ui.remove();
            metaEditor.$ui = null;

            $item
                .removeClass('state-active')
                .removeClass('state-hover')
                .find('.button.star, .col.content ul.meta').show();
            metaEditor.$item = null;
        }
    }
    metaEditor.reattach = function($newItem) {
        var $oldItem = metaEditor.$item;
        delete $$($oldItem).editor;
        
        var $item = metaEditor.$item = $newItem;
        $item.find('.item-context, .button.star, .col.content ul.meta').hide();
        $item.addClass('state-active');
        $item.append(metaEditor.$ui);
        $$($item).editor = metaEditor;
    }
    
    
    var doc = API.cachedDocs[id];
    if (doc.type == "notification") {
        var $loader = $item.find('.editor-loader');
        if ($loader.length == 0) {
            $item.append('<div class="editor-loader"></div>');
            $loader = $item.find('.editor-loader');
        }
        
        $item.addClass('state-progress');
        $loader.show();
        
        var DB = API.filterDB({parent: doc});
        DB.openDoc(doc.ref._id, {
            success: function(doc) {
                $item.removeClass('state-progress');
                $loader.hide();
                
                $$this.metaEditor = metaEditor;
                metaEditor.open($item, doc);
            }
        });
        
    } else {
        $$this.metaEditor = metaEditor;
        metaEditor.open($item, doc);
    }
}
