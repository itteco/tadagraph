function(e) {
    e.stopPropagation();
    
    var self = this;
    
    var text = $.trim($('textarea', this).val());
    
    var attachments = [];
    if ($$(this).attachmentTasks) {
        var tasks = $$(this).attachmentTasks;
        for (var i = 0; i < tasks.length; i++)
            attachments.push(tasks[i].doc);
    }

    if (text != '' && $$(self).options.success) {
        $$(self).options.success(text, attachments);
        
        $$(self).attachmentTasks = [];
        if ($$(self).attachmentUploader)
            $$(self).attachmentUploader.reset();
    }
}
