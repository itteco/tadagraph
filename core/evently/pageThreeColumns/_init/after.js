function(e, match) {
    var app = $$(this).app;
    
    $.evently.connect(document.body, $('.app-menu', this), ['showLoading', 'hideLoading']);
    
    $.evently.connect(document.body, $('.twidget.filter', this), ["profilesLoaded"]);
    
    $('.twidget.filter', this).evently('filterPanel', app);
    $('.app-menu', this).evently('space-menu', app);
}
