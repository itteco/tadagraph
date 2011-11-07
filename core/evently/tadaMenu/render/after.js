function() {
    var $this = $(this);
    
    var $menu = $$(this).$menu = $('.item-context.flow', this);
    
    $menu.find(".button").click(function(e) {
        e.preventDefault();
        
        var $button = $(this);
        var $item = $menu.parent();
        
        $this.trigger($button.data('action'), [$item, $button]);
        
        return false;
    });
}
