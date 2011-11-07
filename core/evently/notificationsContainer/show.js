function(e) {
    e.stopPropagation();
    
    $("ul.flow, ul.cflow", this).trigger("show");
}
