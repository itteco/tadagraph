function(e, status, topics) {
    var $$this = $$(this);
    
    $$this.items[status._id] = status;
    var context = $$this.functions.getItemContext(
        status,
        $$this.filter,
        topics
    );
    
    var flowView = API.flow.lookupView({db: status.db}, context.flowView || "default");
    
    if (flowView && flowView.data) {
        $.extend(context, flowView.data(status, context, topics));
    }
    
    $$this.mustache = flowView && flowView.mustache || $$this.evently['default-view'].mustache;
    
    return context;
}
