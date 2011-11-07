function(page, match, widgets) {
    $$(page).topics = [];
    $.evently.connect(widgets.notificationsFiltered, $(".status-form-widget", page), ["reply"]);
    $.evently.connect(document.body, widgets.notificationsFiltered, ["setFilter", "filter-state-changed"]);
}
