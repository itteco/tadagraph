function(page, match, widgets) {
    $.evently.connect(widgets["topics-list"], widgets["bigLoader"], ["showLoading", "hideLoading"]);
    API.connectVisible(document.body, widgets["topics-list"], ["setFilter", "filter-state-changed"]);
}
