function(e, status) {
    var $this = $(this);
    var $$this = $$(this);
    var $item = $('li:first-child', $this).first();
    
    var $existItem = $('li.item[data-id="' + status._id + '"]', this);
    if ($existItem.size() > 1) {
        var $oldItem = $($existItem[1]);
        var editor = $$($oldItem).editor;
        if (editor) {
            editor.reattach($item);
        }
        $oldItem.after($item).remove();
    }
    
    if ($$this.$activeItem) {
        var $contextButton = $$this.$activeItem.find(".controls .context-menu .icon");
        var offset = $contextButton.offset();
        var $contextMenu = $this.parent().find('.stream-context');
        $contextMenu.css('top', offset.top + $contextButton.height()).css('left', offset.left - $contextMenu.width() + $contextButton.width() - 4);
    }
        
    $$this.functions.applyThumbs($item);
    
    $item.each(function() {
        var $this = $(this);
        $this.find('.fade').hide();
    });
    
    if (status._rev) {        
        $existItem.each(function() {
            var $this = $(this),
            $loader = $this.find('.editor-loader');        
              
            $this.removeClass('state-progress');
            $loader.hide();
        });    
    }
    
    $item.find('.account-of-myself').click(function(e) {
        e.preventDefault();
        location.href = '#account/';
    });

    var showStarred = API.filterState["hide-unstarred"];
    var sinceStarred = $$this.items[$item.data('id')].sinceStarred;

    if (sinceStarred) {
        $item.addClass('show-since-starred');
    }

    if (showStarred && !sinceStarred) $item.hide();
    if (!showStarred && sinceStarred) $item.hide();
    
    if (API.videoHints && $this.is(':visible')) {
        API.videoHints.hide();
    }
    
    if ($item.is('.new-item')) {
        $item.css('background-color', '#f5f9fb');
    }
    
    APPS.core.require('vendor/tadagraph/lib/oembed').wrap($item);
}
