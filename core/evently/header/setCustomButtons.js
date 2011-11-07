function(e, options) {
    options = options || {};
    $(".sys-header.options", this).html(options.rightButtons || "");
    
    if (options.leftButtons) {
        $(".navigation.left-buttons", this).html(options.leftButtons || "");
        $(".navigation.left-buttons", this).show();
    } else {
        $(".navigation.left-buttons", this).hide();
    }
    
    if (options.callback) options.callback.call($(".sys-header.options", this));
}
