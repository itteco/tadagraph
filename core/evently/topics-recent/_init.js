function(e) {
    e.stopPropagation();
    
    //$$(this).newNotificationsCount = {};
    $(this).trigger("render");
}
