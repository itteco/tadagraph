function(page, match, widgets) {
    var $body = $(document.body);
    
    $.evently.connect(widgets.notificationsFiltered, $(".status-form-widget", page), ["reply"]);
    API.connectVisible($body, widgets.notificationsFiltered, ["setFilter", "filter-state-changed"]);
}
