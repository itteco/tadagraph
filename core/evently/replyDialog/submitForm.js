function(e, text, parent) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    var DB = API.filterDB({db: $$this.currentDB});
    
    var profile = API.profile();
    
    if (parent.type == "person") {
        var opt = $$.dialog.find('.sys-private-options select').val();
        if (parent.id != API.username()) {
            text = opt + text;
            text = '@' + parent.nickname + ' ' + text;
        }
        
        parent = null;
    } else {
        var filter = getFilter();
        if (filter.view == 'contact-history' && text.indexOf("@" + filter.nickname) == -1) {
            text = '@' + filter.nickname + ' ' + text;
        }
    }
    
    createStatus(DB, text, profile, {
        topics: parent && parent.topics || [], 
        parent: parent
    }, function(status) {
        // Attach attachments.
        
        var attachments = [];
        if ($$this.attachmentTasks) {
            var tasks = $$this.attachmentTasks;
            for (var i = 0; i < tasks.length; i++)
                attachments.push(tasks[i].doc);
        }
        
        if (attachments.length > 0) {
            status.attachments = attachments;
        }
        
        $$this.attachmentTasks = [];
        if ($$this.attachmentUploader)
            $$this.attachmentUploader.reset();
        
        API.storeStatus(DB, status, {
            success: function() {
            },
            error: function(status, error, reason) {
                $.log(status, error, reason);
            }
        });
    });
    
    return true;
}
