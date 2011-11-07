function(e, filter) {
    e.stopPropagation();

    var $this = $(this);
    
    $this.trigger("open-flow");
}
