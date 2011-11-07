function(e, tag) {
    e.stopPropagation();
    
    var $$this = $$(this);
    var $$ls = $$();
    
    var mutedTags = $$this.mutedTags = $$ls.get("mutedTags") || {};

    if (tag in mutedTags) {
        delete mutedTags[tag];
        $$ls.set("mutedTags", mutedTags);
        $(this).trigger("render");
    }
}
