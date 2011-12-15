function(e, doc, options) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    options = options || {};
    
    var $form       = $(this).children('.status-form');
    var $spacebox   = $form.find('.spacebox');
    var suInput     = $form.find('.input-status');
    
    if (suInput.val() == suInput.attr("placeholder")) {
        suInput.removeClass("placeholder");
        suInput.val("");
    }
    var status_text = suInput.val();
    
    function getPrefix(replyTo, removing) {
        var intId = replyTo.intId;
        if (intId) {
            if (removing || !options.doNotShowReceiver) {
                return "#" + intId + " ";
            } else {
                return ""
            }
        } else {
            if (removing || (!options.doNotShowReceiver && replyTo.created_by.id != API.username())) {
                var prefix = "@" + replyTo.created_by.nickname + " ";
                var origDoc = replyTo;
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
    $$this.replyTo = doc;
    
    suInput.val(getPrefix(doc, false) + status_text);
    
    if (!options.doNotFocus) {
        setCaretPosition(suInput[0], suInput.val().length);
    }
    
    if (!($$this.currentDB) || ($$this.currentDB && ($$this.currentDB.type != doc.db.type || $$this.currentDB.name != doc.db.name))) {
        $$this.currentDB = doc.db;
        $spacebox.selectmenu("value", doc.db.type + "::" + doc.db.name);
    }
    
    function setCaretPosition(ctrl, pos){
        if(ctrl.setSelectionRange) {
            ctrl.focus();
            ctrl.setSelectionRange(pos,pos);
            
        } else if (ctrl.createTextRange) {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }
}
