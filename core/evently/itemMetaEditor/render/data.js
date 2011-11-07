function(e, tail) {
    var meta = $$(this).meta;

    return {
        tail: tail || '',
        items: meta
    }
}
