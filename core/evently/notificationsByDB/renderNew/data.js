function(e, notification) {
    var $$this = $$(this);
    
    $$this.items[notification._id] = notification;
    var context = $$this.functions.getItemContext(
        notification,
        $$this.filter
    );
    
    var flowView = API.flow.lookupView({db: notification.db}, context.flowView || "default");
    
    if (flowView && flowView.data) {
        $.extend(context, flowView.data(notification, context));
    }
    
    $$this.mustache = flowView && flowView.mustache || $$this.evently['default-view'].mustache;
    
    context.isNew = true;
    return context;
}
