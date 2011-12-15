function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    $("div.notifications", this).trigger("hideContextMenu").hide();
    
    var filter = getFilter();
    
    var source = API.flow.lookupSource(filter);
    
    var $widget = $$this.widgets[source.key];
    if ($widget) {
        $widget.show();
        $widget.trigger("show");
        
    } else {
        $widget = $$this.widgets[source.key] = $('<div id="notifications-' + source.key + '" class="notifications"></div>');
        $this.append($widget);
        
        API.connectVisible($this, $widget, ['filter-state-changed']);

        var dsOptions = source.data(filter);
        
        var DB = API.filterDB(filter);
        $widget.evently(
            "notificationsContainer", 
            $$this.app, [$.extend({db: DB}, dsOptions)]);
    }
}
