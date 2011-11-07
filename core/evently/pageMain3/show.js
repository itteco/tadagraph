function(e, match) {
    var $$this = $$(this);
    
    if (API.videoHints) {
        if (!$$this.helperInserted) {
            var helper = $('<div class="helper" />');

            $('.container-main-column', this).append(helper);
            helper.evently('videoHints', APPS["teamfm-core"], []);

            $$this.helperInserted = true;
        }
    }
}
