function() {
    var $this = $(this);
    
    if (!$this.is(":visible"))
        return;
    
    $this.trigger("renderTopics");
}