function(e) {
    var $elem = $(e.target)
    if ($elem.hasClass('input')) {
        var value = $elem.val();
        if (e.keyCode == 13 || e.keyCode == 10) {
            $(this).trigger('parse', [value]);
            
        } else {
            var pattern = /^#\w+\s|^@.+\s|\[.+\]$|.+\s[#@\[\$]$/;
            if (value.match(pattern)) {
                $(this).trigger('parse', [value]);
            }
        }
    }
}
