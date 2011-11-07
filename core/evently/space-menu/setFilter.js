function(e, filter) {
    e.stopPropagation();
    
    var $this = $(this);
    if ($this.is(":visible")) {
        $this.trigger("render");
    }
}
