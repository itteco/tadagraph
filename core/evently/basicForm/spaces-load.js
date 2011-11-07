function(e, spaces) {
    e.stopPropagation();
    
    var $this = $(this);
    
    if ($this.is(':visible')) {
        $this.trigger('render', [spaces]);
        
    } else {
        $this.data('need-reload', true);
    }
}
