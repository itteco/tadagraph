function(e, match) {
    var $$this = $$(this);
    $(".sys-page-header", this).trigger("setOptions", [{
        title: "Loading..."
    }]);
  
    var container = $('.container-main-column', this);

    if (API.videoHints) {
        if (!$$this.helperInserted) {
            var helper = $('<div class="helper" />');

            container.append(helper);
            helper.evently('videoHints', APPS["teamfm-core"], []);

            $$this.helperInserted = true;

        } else {
            var helper = $(' > .helper', container);
            container.append(helper);
        }
    }
}
