function(e, $item) {
    e.stopPropagation();
    
    var _this = this;
    var $this = $(this);
    var $$this = $$(this);
    
    var id = $item.data("id");
    if (!API.cachedDocs[id]) {
        // self is not expected error.
        return false; 
    }
    
    var doc = API.cachedDocs[id];
    if (doc.type == "notification") {
        var DB = API.filterDB({parent: doc});
        
        var $loader = $item.find('.editor-loader');
        if ($loader.length == 0) {
            $item.append('<div class="editor-loader"></div>');
            $loader = $item.find('.editor-loader');
        }
        
        $item.addClass('state-progress');
        $loader.show();
        
        DB.openDoc(doc.ref._id, {
            success: function(doc) {
                $item.removeClass('state-progress');
                $loader.hide();
            
                editDoc(doc);
            }
        });
    } else {
        editDoc(doc);
    }
    
    function editDoc(doc) {
        if ($$this.currentItem) {
            $$this.currentItem.show();
            $$this.currentItem = null;
            $this.trigger("formClosed", [_this]);
        }
        
        $$this.currentDB = doc.db;
        
        var $formEdit = $('.editor.inline.flow.item');
        if ($formEdit.length == 0) {
            $this.trigger("render");
            $formEdit = $this.find('.editor.inline.flow.item');
        }
        
        $item.hide().after($formEdit);
        $formEdit.show();
        
        $$this.currentDoc = doc;
        
        // Fill form visuals.
        
        var $textarea = $formEdit.find('textarea:first');
        $textarea.css('height','');
        $textarea.val($.trim(doc.body)).elastic().focus();
        var space = API.filterSpace({parent: doc});
        if (API.username() == doc.created_by.id || space.isAdmin) {
            //$textarea.parent().show();
            $textarea.removeAttr("disabled");
        } else {
            //$textarea.parent().hide();
            $textarea.attr("disabled", "disabled");
        }
        
        $formEdit.find('.col.heading .avatar')
            .attr('src', API.avatarUrl(doc.created_by.id))
            .attr('title', doc.created_by.nickname);
            
        $formEdit.find('.col.heading .member')
            .attr('title', doc.created_by.nickname)
            .text(doc.created_by.nickname);
        
        $formEdit.find('.col.heading .timestamp')
            .text(API.formatShortDate(doc.created_at));
        
        var $inputDate = $('.input.datepicker', $formEdit);
        var $inputDateReset = $inputDate.next();
        if (doc.due) {
            $inputDate.datepicker("setDate", new Date(doc.due));
            $inputDateReset.show();
        } else {
            $inputDate.val("Due date");
            $inputDateReset.hide();
        }
        
        $$this.currentItem = $item;
    }
}
