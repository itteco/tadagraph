function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    var pages = $$this.pages = [];
    var pagesDict = $$this.pagesDict = {};
    
    var pageIndex = 0;
    
    forEachApp(function(app, appName) {
        if (appName != "core" && app.ddoc.pages && app.ddoc.pages.urls) {
            registerPages(appName, app);
        }
    });
    // Core pages should be registered last, as they have most common url patterns.
    registerPages("core", APPS["core"]);
    
    function registerPages(appName, app) {
        app.ddoc.pages.urls.forEach(function(config) {
            var page = app.ddoc.pages[config.page];
            if (page) {
                pages.push({
                    index: pageIndex,
                    re: new RegExp(config.pattern),
                    page: page,
                    appName: appName
                });
                pagesDict[appName + '/' + config.page] = app.ddoc.pages[config.page];
                pageIndex++;

                var safariPattern = config.pattern.replace(/#/gi, "%23");
                if (safariPattern != config.pattern) {
                    pages.push({
                        index: pageIndex,
                        re: new RegExp(safariPattern),
                        page: page,
                        appName: appName
                    });
                    pageIndex++;
                }
                
            } else {
                console.error("Page", appName, config.page, "not found");
            }
        });
    }
    
    forEachApp(function(app, appName) {
        if (app.ddoc.widgets) {
            for (var widgetId in app.ddoc.widgets) {
                var widget = app.ddoc.widgets[widgetId];
                if (widget.evently && widget.pages) {
                    for (var pageId in widget.pages) {
                        var evently = widget.evently.split('/', 2);
                        if (evently.length == 1) evently.unshift(appName);

                        var page = pagesDict[pageId];
                        if (page) {
                            if (!page.options.widgets) page.options.widgets = [];
                            page.options.widgets.push({
                                widget: evently.join('/'),
                                container: widget.pages[pageId].container,
                                order: widget.pages[pageId].order
                            });
                            
                        } else {
                            console.error("Page", pageId, "not found", pagesDict);
                        }
                    }
                }
            }
        }
    });
    
    API.filterSpaces(function() {
        $.pathbinder.onChange(function(path) {
            $this.trigger("pathChanged", [path]);
        });
        
        $this.trigger("pathChanged", [document.location.hash.substr(1)]);
    });
}
