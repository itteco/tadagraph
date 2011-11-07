function() {
    var $this = $(this);
    var $$this = $$(this);
    
    var $preview = $('.flow-preview', this);
    
    $.pathbinder.onChange(function(path) {
        hideAll();
    });

    // variables

    var $loader  = $preview.find('.loader'),
        $content = $preview.find('.data'),
        $arrow   = $preview.find('.arrow'),
        $close   = $preview.find('.close'),
        mode     = 'preview',
        $item, $itemHover, $itemActive, timerItemShow, timerItemHide, timerHideAll;

    var dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0, diffx, diffy,
        isTextSelection = false, clickTolerance = 2;
    
    function itemHasParent($item) {
        var id = $item.data('id');
        var doc = API.cachedDocs[id];
        if (doc) {
            if (doc.ref) {
                doc = doc.ref;
            }
            if (doc.parent)
                return true;
        }
        
        if ($item.find('.infobox:visible').size() > 0)
            return true;
        
        return false;
    }
    
    $$this.registerItemsSelect = function($select) {
        // prevent text selection
        $select.live('mousedown mouseup', function(event){
            if (event.type == 'mousedown') {
                isTextSelection = false;
                dx1 = Math.abs(event.pageX);
                dy1 = Math.abs(event.pageY);
            }
            else if (event.type == 'mouseup') {
                dx2 = Math.abs(event.pageX);
                dy2 = Math.abs(event.pageY);
                diffx = Math.abs(dx1 - dx2);
                diffy = Math.abs(dy1 - dy2);
                if ((diffx > clickTolerance) && (diffy > clickTolerance)) {
                    isTextSelection = true;
                }
            }
        });
        
        // item events
    
        $select.live('mouseenter mouseleave click', function(event){
            $item = $(this);
    
            clearTimeout(timerItemShow);
            clearTimeout(timerItemHide);
            clearTimeout(timerHideAll);
    
            // mouse over
            if (event.type == 'mouseenter') {
                if (mode == 'view')
                    return;
                previewHide();
                
                if (itemHasParent($item)) {
                    timerItemShow = setTimeout(previewShow, 1000);
                }
            }
    
            // mouse out
            else if (event.type == 'mouseleave') {
                if (mode == 'view')
                    return;
    
                timerItemHide = setTimeout(previewHide, 50);
                timerHideAll = setTimeout(hideAll, 50);
            }
    
            // click
            else if (!isTextSelection) {
                var $target = $(event.target)
                // Check parents which can inherit event.
                if (!($target.is("a") || $target.parents('a').size() > 0)) {
                    previewOpen();
                }
            }
    
        });
    };

    // preview events

    $preview.bind('mouseenter mouseleave click', function(event){

        // mouse over
        if (event.type == 'mouseenter') {
            if (mode == 'view')
                return;
            clearTimeout(timerItemHide);
            clearTimeout(timerHideAll);
            $item.addClass('state-preview-hover')
        }

        // mouse out
        else if (event.type == 'mouseleave') {
            if (mode == 'view')
                return;
            timerItemHide = setTimeout(previewHide, 50);
            timerHideAll  = setTimeout(hideAll, 50);
            $itemHover = $item;
        }

        // click
        else {
            window.location.href = $preview.data("url");
        }

    });

    $preview.find('a').live('click', function(e){
        e.stopPropagation();
    });

    $close.click(function(e){
        hideAll();
        $itemActive.removeClass('state-preview-active');
        mode = 'preview';
        e.preventDefault();
        e.stopPropagation();
    });

    function previewShow() {

        if (mode == 'view') {
            $close.show();
        }
        else {
            $close.hide();
        }

        // cached

        if ($item.data('preview-cache')) {
            $content.html($item.data('preview-cache'));
            $content.show();
            $preview.show();
            $loader.hide();
            $preview.data('data-id',$item.data('id'));
            updatePosition();
        } else {

            $content.hide();
            $preview.show();
            $loader.show();
            $preview.data('data-id',$item.data('id'));

            updatePosition();
            
            $this.trigger("loadContent", [{
                id: $item.data('id'),
                callback: function(html) {
                    $loader.hide();
                    $content.html(html);
                    $content.show();
                    $item.data('preview-cache', html);
                    updatePosition();
                },
                setRootUrl: function(url) {
                    $preview.data("url", url);
                }
            }])
        }

    }



    function previewHide() {
        if ($itemHover) {
            $itemHover.removeClass('state-preview-hover');
        }
        if ($preview.css('display') == 'block') {
            if ($item.data('id') != $preview.data('data-id')) {
                $arrow.css('top', 0);
                $preview.hide();
                $preview.data('data-id',0);
                $item.removeClass('state-preview-hover');
            }
        }
    }



    function hideAll() {
        $arrow.css('top', 0);
        $preview.hide();
        $preview.data('data-id',0);
        if ($item) {
            $item.removeClass('state-preview-hover');
        }
        if ($itemActive) {
            $itemActive.removeClass('state-preview-active');
        }
        mode = 'preview';
    }
    


    function previewOpen() {

        if (!itemHasParent($item))
            return;

        if (!($itemActive && ($item.data('id') == $itemActive.data('id')))) {
            if ($itemActive)
                $itemActive.removeClass('state-preview-active');
            $itemActive = $item;
        }

        if ($itemActive.hasClass('state-preview-active')) {
            $itemActive.removeClass('state-preview-active');
            mode = 'preview';
            hideAll();
        }
        else {
            $itemActive.addClass('state-preview-active');
            mode = 'view';
            previewHide();
            previewShow();
        }

    }


    // update position/arrow

    function updatePosition() {

        var item = {
            height: $item.outerHeight(),
            offset: $item.offset(),
            width:  $item.outerWidth()
        }
        
        var previewOffset = 0; //8
        if ($item.parent().hasClass("todo"))
            previewOffset = 8;
        
        
        var itemCss = {
            top:  item.offset.top,
            left: item.offset.left + item.width + previewOffset
        }

        var arrowOffset = item.height/2;
        var previewHeight = $preview.outerHeight();
        var overflow    = itemCss.top - $(window).scrollTop() + previewHeight - $(window).height();

        if (overflow > 0) {
            itemCss.top -= overflow + 10;
            arrowOffset += overflow + 10;
        }

        arrowOffset -= 22;

        // fixes
        if (arrowOffset > (previewHeight - 30)) {
            arrowOffset = previewHeight - 45;
        }
        if (previewHeight < item.height) {
            arrowOffset = previewHeight.height/2 - 22;
        }

        $preview.css(itemCss);
        $arrow.css('top', arrowOffset);

    }
}