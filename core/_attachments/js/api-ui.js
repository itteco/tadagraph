
/* -- -- -- -- -- -- -- -- -- -
 *  API UI.
 * -- -- -- -- -- -- -- -- --*/
API.UI = {};

API.UI.searchPresent = false;

/*
 * -- -- -- -- -- -- -- -- -- - UI.Dialog -- -- -- -- -- -- -- -- --
 */

// open existing or create new dialog instance.
API.openDialog = API.UI.openDialog = (function() {

// creates dialog with {#dialogId*}.
// Do not call directly, use API.UI.showDialog()
var createDialog = function(dialogId) {
    var $dialog = null;
    var $this = $('<div></div>');
    var parts = dialogId.split('/', 2);
    var stub = APPS[parts[0]].ddoc.dialogs[parts[1]];
    var evently = {
        _init: function(e) {
            e.stopPropagation();
            $(this).trigger('render');
        },
        render: {
            mustache: stub.mustache,
            after: function() {
               // var $this = $(this);
                $dialog = $this.find('.tdialog');
                $dialog.dialog($.extend(
                    {
                        dialogClass: 'tdialog manage',
                        width: 530,
                        height: 'auto',
                        resizable: false,
                        modal: true,
                        hide: 'fade',
                        autoOpen: false
                    },
                    stub.options || {},
                    {
                        create: function() {
                            var $dialog = $(this);
                            $$(this).app = APPS[parts[0]];

                            var $submit = $dialog.find('.button .button-submit').button();
                            var $message = $dialog.find('.controls .message');
                            $submit.click(function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                $message.hide();
                                $this.trigger('_submit', [$dialog, $dialog.data('callback')]);
                            });
                            $dialog.keyup(function(e) {
                                if (e.keyCode == 13 || e.keyCode == 10) {
                                    $submit.click();
                                }
                            });

                            $this.trigger('init', [$dialog]);
                        },
                        open: function() {
                            var $dialog = $(this);

                            $dialog.find('.controls .message').hide();
                            $dialog.find('.button .button-submit').button('enable').removeClass('ui-state-progress');
                            $this.trigger('open', [$dialog, $dialog.data('data')]);


                        }
                    }
                ));
            }
        },
        init: stub.init || function(e) {e.stopPropagation();},
        open: stub.open,
        _submit: stub.submit,
        loading: function (e, flag){
            var $submit = $dialog.find('.button .button-submit').button();
            $submit.button(flag? 'disable': 'enable').toggleClass('ui-state-progress', flag);
            $dialog.dialog(flag? 'disable': 'enable');
            return $dialog;
        },
        close: function (e){
            $dialog.dialog('close');
            return $dialog;
        },
        submit: function (e, data){
            $this.trigger('_submit', [$dialog, $dialog.data('callback'), data]);
            return $dialog;
        },
        hint: function (e, text, isError){
            var $message = $dialog.find('.controls .message');
            $message.removeClass(!isError? 'error': 'success').addClass(isError? 'error': 'success').html(text);
            $message[text? 'show': 'hide']();
            $message.find('a').click(function(e) { $dialog.dialog('close');});
            return $dialog;
        }
    };
    $this.evently(evently);
    return $dialog;
};

// Dialog registry
var dialogs = {};

return function(dialogId, data, callback) {
    (dialogs[dialogId] || (dialogs[dialogId] = createDialog(dialogId)))
        .data('data', data)
        .data('callback', callback)
        .dialog('open');
};

})();

API.UI.invokeWidgetCallback = function($this, callback, data, successMessage) {

    $this.trigger('loading',true);
    callback && callback(true, data, function(error) {
        $this.trigger('loading',false);
        if (error) {
            $this.trigger('hint',[error.reason, true]);
        } else {
            $this.trigger('hint', successMessage||'');
            $this.trigger('close');
        }
    });

}
API.UI.buttonLoader = function($button, flag){
    $button.button(flag? 'disable': 'enable').toggleClass('ui-state-progress', flag);
}

API.createWidget = API.UI.createWidget = function(id, container, args) {
    var evently = id.split('/', 2);
    var widget = $('#' + id, container);

    if (widget.length == 0) {
        widget = $('<div id="' + id + '" class="page-widget"></div>');
        widget.data('widget', evently.join('/'));
        container.append(widget);
        try {
            widget.evently(evently[1], APPS[evently[0]], args);
            if (DEBUG)
                $.log("create widget", id, widget);

        } catch (e) {
            $.log('Unable to create widget', id,  e);
            console.error(e.stack);
        }
    }
    return widget;
};


API.UI.initSideBlocksOnScrolling = function ($left, $right) {
    var $window = $(window);

    var navs = [$left, $right];

    if ($left.size() == 0) {
        return;
    }

    var offsetY = $left.offset().top - 20;

    function setPosition() {
        $(navs).each(function(){
            var $item = $(this);
            if (($window.scrollTop() > offsetY) && ($window.height() > $item.height())) {
                $item.addClass('fixed');
            }
            else {
                $item.removeClass('fixed');
            }
        });
    }

    $window.scroll(function() {
        setPosition();
    });

    $window.resize(function() {
        setPosition();
    });
};
