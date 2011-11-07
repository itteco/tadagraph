function() {
    var $this = $(this);
    var $$this = $$(this);
    
    var $attachmentManager = $(".attachments-manager", this);
    $attachmentManager.evently("attachmentsManager", APPS.core, [this, $("#editor-tada-uploader", this)[0], $("#editor-tada-uploader-list", this)[0]]);
    $.evently.connect($this, $attachmentManager, ["formClosed"]);
    
    $('[placeholder]', this).placeholder();
    $('textarea', this).elastic();
    
    var $formEdit = $('.editor.inline.flow.item', this);
    
    /* ************************************************************************************************************** */
    /* Date picker */

    var $inputDate = $formEdit.find('.input.datepicker');
    var $inputDateReset = $inputDate.next();
    $inputDate.datepicker({
        dateFormat: 'd M',
        onSelect:   function(){
            $inputDateReset.show();
        }
    });
    $inputDateReset.click(function(){
        $inputDateReset.hide();
        $inputDate.val('Due date');
        return false;
    });
    
    // cancel
    $formEdit.find('.editor-cancel').click(function() {
        formEditClose();
        return false;
    });
    $formEdit.keydown(function(event){
        if (event.keyCode == 27) {
            formEditClose();
        }
    });

    // submit
    $formEdit.find('.editor-save').click(function() {
        formEditSave();
        return false;
    });
    $formEdit.keydown(function(event){
        if (event.ctrlKey && (event.keyCode == 13 || event.keyCode == 10)) {
            formEditSave();
        }
    });

    // save
    function formEditSave() {
        var $item = $$this.currentItem;

        var doc = $$this.currentDoc;
        
        
        // Body.
        var body = $formEdit.find('textarea:first').val();
        
        if (!($.trim(body))) {
            return;
        }
        
        // TODO: this is UI only check. True authorizaton must be provided by update validator.
        // Attachments. 
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
        
        // Due.
        
        if ($inputDate.val() == 'Due date') {
            delete doc["due"];
        } else {
            doc.due = $inputDate.datepicker("getDate");
        }
        
        var changes = diffStatusBody(doc.body, body);
        $.log(changes);
        if (changes.tag) {
            var $body = $(document.body);
            for (var tag in changes.tag)
                if (changes.tag[tag] == "a")
                    $body.trigger("entered-tag", [tag.substr(1)]);
        }
        
        doc.body = body;
        applyMetaDiff(doc, changes);
        
        // TODO: prepare html.
        $item.find('.col.content div.text').html(body);
        
        formEditClose();
        
        var $loader = $item.find('.editor-loader');
        if ($loader.length == 0) {
            $item.append('<div class="editor-loader"></div>');
            $loader = $item.find('.editor-loader');
        }
        
        $item.addClass('state-progress');
        $loader.show();
        
        var DB = API.filterDB({parent: doc});
        storeStatusAndUpdateNotifications(DB, doc, {
            success: function() {
                $item.removeClass('state-progress');
                $loader.hide();
            },
            error: function() {
                // TODO: rollback visuals.
                $item.removeClass('state-progress');
                $loader.hide();
            }
        });
    }

    // close
    function formEditClose() {
        if ($$this.currentItem) {
            $$this.currentItem.show();
            $$this.currentItem = null;
        }
        
        $formEdit.hide();
    }
}
