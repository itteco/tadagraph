function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    var $status = $this.find('.input-status'),
    currentSpace = {
        type: $$this.currentDB.type,
        name: $$this.currentDB.name
    };

    if (/::/.test(currentSpace.name)) {
        var split = currentSpace.name.split(/::/, 2);
        currentSpace.type = split[0];
        currentSpace.name = split[1];
    }
    var DB = API.filterDB({db: currentSpace});
    
    if ($status.val() == $status.attr("placeholder") || $status.val() == '' ||
        DB == null || DB.type == "user" || !currentSpace.name) {
        // Prevent save if no text. 
        return false;
    }
    
    $this.trigger("startSaving");
    
    var profile = API.profile();
    var topics = false;
    if (getFilter().topicId) {
        var storedTopics = $$("#id_topics").storedTopics;
        if (storedTopics[getFilter().topicId]) {
            topics = [storedTopics[getFilter().topicId]];
        }
    }

    var text = $status.val();

    if (getFilter().view == 'contact-history') {
        var contact = getFilter().nickname;

        if (contact != API.username()) {
            text = $this.find('.sys-message-type input[name=tada-type]:checked').val() + text;
            text = '@' + contact + ' ' + text;
        }
    }
    
    createStatus(DB, text, profile, {topics: topics, parent: $$this.replyTo || getFilter().parent || null}, function(status) {
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
        
        $status.val('').css('height','');
        
        if (!($$this.inline)) {
            $status.focus();
        }
        
        $this.trigger("clearReply");
        
        API.storeStatus(DB, status, {
            success: function() {
                $this.trigger("stopSaving");
            },
            error: function(status, error, reason) {
                $.log(status, error, reason);
                $this.trigger("stopSaving");
            }
        });
    });
    
    return true;
}
