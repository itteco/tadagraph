function(e, options) {
    var self = this;
    
    var widget = $(".flow, .cflow", this);
    var loader = $(".loader", this);
    
    $.evently.connect(widget, loader, ["hideLoading", "showLoading"]);
    
    loader.evently("smallLoader", $$(this).app);
    widget.evently("notificationsByDB", $$(this).app, [options]);
    $.evently.connect(this, widget, ["addMeta", "editItem", "deleteItem", "filter-state-changed"]);
    API.connectVisible(document.body, widget, ["setFilter"]);

    var $contextMenu = $('.stream-context', this);
    
    $contextMenu.mouseleave(function() {
        setTimeout(function() {
            $(self).trigger("hideContextMenu");
        }, 300);
    });
}
