function(e, topics, initialLoad) {
    e.stopPropagation();
    
    var newItems = {};
    if (!initialLoad) {
        topics.forEach(function(topic) {
            newItems[topic._id] = true;
        });
    }
    
    $(this).trigger("render", [newItems]);
}
