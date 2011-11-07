function(e, filter) {
    e.stopPropagation();
    
    var features = $(".features", $$(this).dialog);
        features.html("");
    
    if (filter.topic) {
        var tags = getPossibleTopicTagsToAdd(filter.topic);
        var html = "";
        tags.forEach(function(tag) {
            html += '<label class="view-link"><input type="checkbox" value="' + tag + '" /> ' + tag + '</label>';
        });
        features.html(html);
    }
}