function(e) {
    e.preventDefault();
    e.stopPropagation();

    var $$this = $$(this);

    API.videoHints && API.videoHints.toggle($$this.hintsVisible);
}
