function(e) {
    e.stopPropagation();
    
    var options = $$(this).options;
    options.close && options.close();
}
