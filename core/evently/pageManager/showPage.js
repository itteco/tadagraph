function(e, page, match, filter) {
    // @XXX All menus deselection. We don't care about any menu here
   // $('.account-menu').removeClass('selected');
    $('.widget-selectable li.selected').removeClass('selected');

    var pageEvently = page.page.options.widget.split('/', 2);
    if (pageEvently.length === 1) {
        pageEvently.unshift(page.page.options.app || page.appName);
    }

    var page_id = 'page-' + pageEvently[1];
    var page_container = $('#' + page_id, this);
    softShow($('div.page', this), page_id);

    var page_created = false;
    if (page_container.length == 0) {
        page_container = $('<div id="' + page_id + '" class="page body"></div>');
        $(this).append(page_container);
        try {
            page_container.evently(pageEvently[1], APPS[pageEvently[0]], [match]);

        } catch (e) {
            $.log('Unable to create page', pageEvently.join('/'));
            console.error(e.stack);
            return;
        }
    }

    var widgets = {};

    var widgets_ids = [];
    if (page.page.options.widgets) {
        if (!page.page._widgets) {
            var w = page.page.options.widgets.slice(0);
            w.forEach(function(widget, i) {
                if (!widget.order) widget.order = i;
            });
            w.sort(function(a, b) {return a.order < b.order? -1: a.order > b.order? 1: 0;});
            page.page._widgets = w;
        }

        page.page._widgets.forEach(function(widget, i) {
            var area_container = $(widget.container, page_container);
            var widget_id = 'widget-' + page.index + '-' + i;
            var widget_container = $('#' + widget_id, area_container);

            if (widget_container.length == 0) {
                var evently = widget.widget.split('/', 2);
                if (evently.length == 1) {
                    evently.unshift(widget.app || page.appName);
                }

                widget_container = $('<div id="' + widget_id + '" class="page-widget"></div>');
                widget_container.data('widget', evently.join('/'));
                widget_container.data('$page', page_container);
                area_container.append(widget_container);

                try {
                    if (DEBUG)
                        $.log("create widget", evently.join('/'), "on page", pageEvently.join('/'));
                    widget_container.evently(evently[1], APPS[evently[0]], [page_container]);

                } catch (e) {
                    $.log('Unable to create widget', evently.join('/'), 'on page', pageEvently.join('/'), e);
                    console.error(e.stack);
                    //throw(e);
                }
                page_created = true;
            }

            widgets[widget.id || widget.widget] = widget_container;
            widgets_ids.push(widget_id);
        });
    }

    softMultiShow($('div.page-widget', page_container), widgets_ids);

    // TODO for future: create separate parser for match with async callback.

    if (page_created) {
        runIfFun2(page.page.afterCreate, [page_container, match, widgets]);
    }

    page_container.trigger('show', [match, widgets]);

    runIfFun2(page.page.show, [page_container, match, widgets, filter]);

    API.trigger('afterPageShown', [page, pageEvently.join('/')]);


    function softShow(select, id) {
        select.each(function() {
            var el = $(this);
            el.toggle(el.attr('id') == id);
        });
    }

    function softMultiShow(select, ids) {
        select.each(function() {
            var el = $(this);
            el.toggle($.inArray(el.attr('id'), ids) > -1);
        });
    }
}
