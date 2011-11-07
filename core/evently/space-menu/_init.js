function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    
    $.evently.connect(document.body, $this, ["setFilter"]);
    $this.trigger("render");
}
