function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    
    $this.trigger("clearReply");
    $this.trigger("resetForm");
}
