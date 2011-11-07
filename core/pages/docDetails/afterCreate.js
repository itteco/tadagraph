function(page, match, widgets) {
    var $header = $(".sys-page-header", page);
    var $statusForm = $(".status-form-widget", page);
    
    $.evently.connect(widgets["docDetails"], $header, ["setCustomButtons"]);
    $.evently.connect(widgets["docDetails"], $statusForm, ["reply"]);
    $.evently.connect(widgets["docsTree"], $statusForm, ["reply"]);
}
