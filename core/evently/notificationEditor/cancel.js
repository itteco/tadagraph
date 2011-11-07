function(e) {
    e.stopPropagation();
    
    if ($$(this).options.cancel)
        $$(this).options.cancel();
}
