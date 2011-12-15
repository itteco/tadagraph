function(e, items, newItems) {
    var that = this;

    var $items = $(".new-item", this);
    
    $items.each(function() {
        $(this).find('.fade').hide();
    });
    
    $(this).trigger("applyFilter");
    
    initItem($('.list.topic .item', this));
    //    (function() {
    var $menu = $('.item-context.topics', this);
    var $form = $('.editor.inline.topics', this);

    function initMenu($menu, $items) {
        $menu.find('.button').bind('click', function(e) {
            e.preventDefault();

            var $button = $(this);
            var $item = $menu.parent();
            $item.trigger($button.data('event'));
        });

        var activateMenu = function($menu, $item) {
            $item.prepend($menu);
            $item.addClass("state-hover");
            $menu.show();
        }

        $items.bind('mouseenter mouseleave', function(event) {
            var $item = $(this);
            if (event.type == 'mouseenter') {
                activateMenu($menu, $item);

            } else {
                $item.removeClass("state-hover");
                $menu.hide();
            }
        });
    }

    initMenu($menu, $('.list.topic .item.hover', this));

    $form.find('.editor-cancel').click(function(e) {
        e.preventDefault();

        $form.trigger("item-editor-close");
        return false;
    });

    $form.find('.editor-save').click(function(e) {
        e.preventDefault();

        $form.trigger("item-editor-save");
        return false;
    });

    $form.keydown(function(event) {
        if (event.keyCode == 27) {
            $form.trigger("item-editor-close");
        }
        if (event.keyCode == 13) {
            $form.trigger("item-editor-save");
        }
    });

    $(this).unbind('addTopicClick').bind('addTopicClick', function(e, link) {
        e.preventDefault();
        e.stopPropagation();

        $cItem = null;
        var $button = $(link).parent();
        $button.hide();
        $(that).prepend($form);
        $$(that).editableItem = null;

        closeAllEdits();

        $form.data('has-hidden', $button);
        $form.find('.archived').hide();
        $form.show().find('input[type=text]:first').val('').focus();

        if (getFilter().tag) {
            $form.find('input[type=checkbox][value=' + getFilter().tag + ']')
            .attr('checked', 'checked')
            .attr('disabled', 'disabled');
        }
        return false;
    });

    // close all edits
    function closeAllEdits() {
        $form.trigger("item-editor-close");
    }
        
    function initItem($element) {
        $element.append('<div class="editor-loader"></div>');
    }

    $form.bind('item-editor-close', function(e) {
        if ($form.data('has-hidden')) {
            $form.data('has-hidden').show();
        }
    });

    if (API.videoHints) {
        if ($$(this).hasTopics) {
            API.videoHints.hide();
            $(this).trigger('hideHint');
        } else {
            API.videoHints.show();
        }
    }   
}
