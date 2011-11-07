function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    
//    $this.bind("click", function(e) {
//        e.preventDefault();
//        
//        var tag = $(e.target).data('tag');
//        $this.trigger("select-tag", [tag]);
//    });
//    
    $this.trigger('render');
    
}
