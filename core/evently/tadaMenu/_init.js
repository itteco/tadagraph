function() {
    var self = this;
    
    $('.flow .item.hover').live('mouseenter mouseleave', function(event){
        var $item = $(this);
        if ($item.hasClass('context-menu-disabled') || $item.hasClass('state-active'))
            return;
        
        var $menu = $('.item-context.flow');
        if ($menu.length == 0) {
            $(self).trigger("render");
            $menu = $('.item-context.flow', self);
        } 
        
        if (event.type == 'mouseenter') {
            var id = $item.data('id');
            if (API.cachedDocs[id]) {
                var doc = API.cachedDocs[id];
                var space = API.filterSpace({parent: doc});
                
                var specMessage = $(".message", $item).length > 0 || $item.hasClass("message") || $item.hasClass("compact");
                
                var owner = doc.created_by.id == API.username();
                if (!specMessage && (owner || space && space._admin)) {
                    $menu.find(".button.delete").parent().show();
                    
                } else {
                    $menu.find(".button.delete").parent().hide();
                }
                
//                if (!owner && doc.type == "notification" || specMessage) {
//                    $menu.find(".button.archive").parent().show();
//                    
//                } else {
                    $menu.find(".button.archive").parent().hide();
//                }
                
                if (!specMessage) {
                    $menu.find(".button.edit").parent().show();
                    
                } else {
                    $menu.find(".button.edit").parent().hide();
                }
                
                if (!specMessage && getFilter().db.type == "person") {
                    $menu.find(".button.forward").parent().show();
                    
                } else {
                    $menu.find(".button.forward").parent().hide();
                }
                
                if (space && space._allowPublish && (space._admin || space._virtual_admin)) {
                    $menu.find('.button.publish').parent().show();
                    
                    var _doc = doc;
                    $menu.find('.button.publish').toggleClass('published', _doc.tags && _doc.tags.indexOf('public') > -1);
                    
                } else {
                    $menu.find('.button.publish').parent().hide();
                }
                
                $item.prepend($menu);
                $menu.show();
            }
            
        } else {
            $menu.hide();
        }
    });
}
