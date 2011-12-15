function(e, match) {
    var app = $$(this).app;
    
    $.evently.connect($(document.body), $(".app-menu", this), ["showLoading", "hideLoading"]);
    
    $(".app-menu", this).evently("space-menu", app);
}
