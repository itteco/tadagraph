function() {
    if ($(this).is(":visible")) {
        var $status = $('#id_inline_form');
        $$(this).formInitCallback($status);
    }
}