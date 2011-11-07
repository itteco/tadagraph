function(e, options) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    options = options || {};
    
    $$this.inline = options.inline;
    
    $.evently.connect(document.body, $this, ['spaces-load', 'setFilter']);
}
