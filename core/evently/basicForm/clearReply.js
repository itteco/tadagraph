function(e) {
    var $$this = $$(this);
    var replyTo = $$this.replyTo;
    var suInput = $('.input-status', this);
    
    var status_text = suInput.val();
    
    function getPrefix(replyTo, removing) {
        var intId = replyTo.intId || (replyTo.ref && replyTo.ref.intId);
        if (intId) {
            return "#" + intId + " ";
        } else {
            if (removing || (!options.doNotShowReceiver && replyTo.created_by.id != API.username())) {
                var prefix = "@" + replyTo.created_by.nickname + " ";
                var origDoc = replyTo.type == "notification"? replyTo.ref: replyTo;
                if (origDoc.db.type == "person" && origDoc.tags && origDoc.tags.indexOf("dm") >= 0) {
                    prefix = "#dm " + prefix;
                }
                return prefix;
            } else {
                return "";
            }
        } 
    }
    
    // Remove old @receiver #id.
    if ($$this.replyTo) {
        var template = getPrefix($$this.replyTo, true);
        if (status_text.indexOf(template) == 0) {
            status_text = status_text.replace(template, "");
        }
    }
    
    suInput.val(status_text);
    
    $$this.replyTo = null;
}
