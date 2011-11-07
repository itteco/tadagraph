function(e, filter) {
    e.stopPropagation();
    
    var $this = $(this);
    
    $this.trigger("reset", [filter]);

    $this.trigger("render");
}
