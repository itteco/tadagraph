function(e, item) {
    var $$this = $$(this);
    
    var $item = $('li.item[data-id="' + item._id + '"]:visible', this);
    
    $$this.functions.applyThumbs($item);
    
    $item.find('.account-of-myself').click(function(e) {
        e.preventDefault();
        location.href = '#account/';
    });

    var showStarred = API.filterState["hide-unstarred"];
    var sinceStarred = $$this.items[item._id].sinceStarred;

    if (sinceStarred) {
        $item.addClass('show-since-starred');
    }

    if (sinceStarred && !showStarred) $item.hide();
    if (!sinceStarred && showStarred) $item.hide();
    
    if ($item.is('.new-item'))
        API.queueNewItems($item);
    
    APPS.core.require('vendor/tadagraph/lib/oembed').wrap($item);
}
