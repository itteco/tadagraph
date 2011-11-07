function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    
    API.filterSpaces(function(spaces) {
        $this.trigger("render", [spaces]);
    });
}
