function(e, path) {
    var $this = $(this);
    var $$this = $$(this);
    
    API.filterByPath(path, function(filter, path) {
        var pages = $$this.pages;
        for (var i = 0; i < pages.length; i++) {
            var page = pages[i];
            var match = page.re.exec(path);
            if (match) {
                if (API.filterValid(filter, page.appName)) {
                    $this.trigger('showPage', [page, match, filter]);

                    // log event in ga
                    if (window._gaq) { 
                        var shortPath = document.location.hash.replace(/\/\w{32,}/ig, "").replace(/\/#\d+/ig, "");
                        _gaq.push( ['_trackEvent', API.profile().nickname, 'view', shortPath] ); 
                    }
                    
                    return;
                    
                } else {
                    break;
                }
            }
        }
        
        filter.view = "";
        document.location.href = getUrlByFilter(filter);
    });
}
