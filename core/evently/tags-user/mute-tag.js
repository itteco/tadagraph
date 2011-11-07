function(e) {
    e.stopPropagation();
    
    var $$this = $$(this);
    var $$ls = $$();
    
    var $item = $(e.target).parent();
    var $tadatip = $('.tadatip', this);
    
    var mutedTags = $$this.mutedTags = $$ls.get("mutedTags") || {};
    mutedTags[$item.data("tag")] = true;
    $$ls.set("mutedTags", mutedTags);
    
    $item.slideUp('fast',function(){
        if (!$$this.tadatipShown) {
            $$this.tadatipShown = true;
            $tadatip.fadeIn(1000);
            setTimeout(function() {
                $tadatip.fadeOut(2000);
                $$this.tadatipShown = false;
            }, 4000);
        }
    });
}
