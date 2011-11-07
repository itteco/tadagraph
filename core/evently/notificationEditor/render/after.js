function(e) {
    $('textarea', this)
        .removeClass('placeholder')
        .elastic()
        .placeholder()
        .focus()
        .parent().parent().addClass('state-focus');
    
    var $attachmentsManager = $(".attachments-manager", this);
    $.evently.connect($(this), $attachmentsManager, ["projectChanged"]);
    $attachmentsManager.evently("attachmentsManager", APPS.core, [this, $(".tada-file-uploader", this)[0], $(".tada-file-uploader-list", this)[0]]);
}
