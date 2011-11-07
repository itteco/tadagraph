function(page, match, widgets) {
    $.evently.connect(widgets["notificationsFiltered"], $("#id_inline_form"), ["reply"]);
}