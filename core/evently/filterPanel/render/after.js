function() {
    var $this = $(this);
    var $$this = $$(this);
    
    $$this.dialogs.members = $('.ui-dialog-invisible.owner.atowner', this).dialog({
        autoOpen:       false,
        dialogClass:    'ui-dialog-invisible',
        width:          150,
        height:         50,
        resizable:      false,
        create: function(e, ui) {
            var $dialog = $(this);
            $('.control.owner.atowner', this).selectmenu({
                style: 'dropdown',
                icons: [],
                close: function() {
                    $dialog.dialog('close');
                },
                change: function(e, item) {
                    $dialog.dialog('close');
                    var value = item.value;
                    setTimeout(function() {
                        var filter = $$($dialog).filter;
                        $this.trigger("select-filter", [filter, value]);
                    }, 5);
                }
            });
        },
        open: function(e, ui) {
            var filter = $$(this).filter;
            $('.control.owner.atowner', this)
                .selectmenu("value", API.filterState[filter] || API.username())
                .selectmenu('open');
        }
    });


    $this.find(".button.member").bind("click", function(e) {
        e.preventDefault();
        var $filter = $(this);
        
        var itemOffset = $filter.parent().parent().offset();
        var windowOffset = $(window).scrollTop();
        var position = [
            itemOffset.left,
            itemOffset.top - windowOffset - 5
        ];
        var $dialog = $$this.dialogs[$filter.data('list')];
        if (!$dialog) {
            $.log("error: $dialog is null", $filter, $filter.data('list'), $$this.dialogs);
        }
        $$($dialog).filter = $filter.data('filter');
        $dialog.dialog('option', 'position', position).dialog('open');
        return false;
    });
    
    var filter = getFilter();
    
    var $search = $this.find(".search input");
    
    $search.change(function() {
        if (this.value.length >= 3) {
            $this.trigger("select-filter", ["search", this.value]);
            // Hardcode for contacts.
            if (filter.view != 'contact') {
                document.location.href = getUrlByFilter({db: getFilter().db, view: 'search'}); // TODO: hide db
            }
        }
    });
    
    var cspTimer;
    function prepareChangeSearchParam() {
        if (cspTimer)
            clearTimeout(cspTimer);
        cspTimer = setTimeout(function() {
            $this.trigger("select-filter", ["search", $search.val()]);
        }, 1000);
    }
    
    $search.keyup(function(e) {
        if ($search.val().length >= 3) {
            // Hardcode for contacts.
            if (filter.view == 'contact') {
                prepareChangeSearchParam();
            } else {
                if (e.keyCode == 13 || e.keyCode == 10) {
                    $this.trigger("select-filter", ["search", this.value]);
                    // Hardcode for contacts.
                    document.location.href = getUrlByFilter({db: getFilter().db, view: 'search'}); // TODO: hide db
                }
            }
        }
    });
    
    // Hardcode for contacts.
    $this.find('.search').toggleClass('hidden', !API.UI.searchPresent);
}
