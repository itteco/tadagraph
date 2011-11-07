function(e, newNotificationsCount){
    e.stopPropagation();
    //$$(this).newNotificationsCount = newNotificationsCount['topics'] || {};
    $(this).trigger('render');
}
