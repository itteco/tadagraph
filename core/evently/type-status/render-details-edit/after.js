function() {
    $(".attachments-manager", this).evently("attachmentsManager", APPS.core, [this, $("#editor-tada-uploader", this)[0], $("#editor-tada-uploader-list", this)[0]]);
    $.evently.connect($(this), $(".attachments-manager", this), ["formClosed"]);
    
    $('[placeholder]', this).placeholder();
    $('textarea', this).elastic();
    
    var $inputDate = $('.editor.document .input.datepicker', this);
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
    
    var doc = $$(this).doc;
    
    if (doc.due) {
        $inputDate.datepicker("setDate", new Date(doc.due));
    }
}
