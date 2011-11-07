function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    var $form = $('.editor.document', this);
    var $inputDate = $form.find('.input.datepicker');
    
    var doc = $$this.doc;

    // Body.
    var body = $form.find('textarea:first').val();

    if (!($.trim(body))) {
        return;
    }

    var changes = diffStatusBody(doc.body, body);
    if (changes.tag) {
        var $body = $(document.body);
        for (var tag in changes.tag)
            if (changes.tag[tag] == "a")
                $body.trigger("entered-tag", [tag.substr(1)]);
    }
    
    doc.body = body;
    applyMetaDiff(doc, changes);
    
    if ($inputDate.val() == 'Due date') {
        delete doc["due"];
        
    } else {
        $.log($inputDate.datepicker("getDate"));
        doc.due = $inputDate.datepicker("getDate");
    }
    
    var attachments = [];
    if ($$this.attachmentTasks) {
        var tasks = $$this.attachmentTasks;
        for (var i = 0; i < tasks.length; i++)
            attachments.push(tasks[i].doc);
    }

    $$this.attachmentTasks = [];
    if ($$this.attachmentUploader)
        $$this.attachmentUploader.reset();

    if (attachments) {
        doc.attachments = doc.attachments?
            doc.attachments.concat(attachments):
            attachments;
    }
    
    $form.addClass('state-progress');
    
    var DB = API.filterDB({parent: doc});
    storeStatusAndUpdateNotifications(DB, doc, {
        success: function() {
            $form.removeClass('state-progress');
            $this.trigger('render-details');
        },
        error: function() {
            $form.removeClass('state-progress');
        }
    });
}
