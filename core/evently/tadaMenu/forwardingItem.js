function(e, $item) {
    e.stopPropagation();
    
    var $this = $(this);
    var $menu = $$(this).$menu;
    
    API.filterSpaces(function(spaces) {
        spaces = spaces.filter(isActiveSpace)
        .map(function(s) {
            return {
                id: s.type + "::" + s.id,
                name: s.name || s.id,
                type: s.type,
                selected: false
            }
        });
        
        var $menuForward = $($.mustache(
'<div class="editor-menu tada forward hidden">' +
    '<select title="Forward to:" id="tada-forward" class="linkselect">' +
        '{{#spaces}}' +
            '<option value="{{id}}" {{#selected}}selected="selected"{{/selected}}>{{name}}</option>' +
        '{{/spaces}}' +
    '</select>' + 
'</div>'
        , {spaces: spaces}));

        $('.flow .item.state-forward').removeClass('state-forward');
        setTimeout(function() {
            $item.append($menuForward);
            $('#tada-forward').selectmenu({
                style: 'forward',
                close: function() {
                    $item.removeClass('state-forward');
                    $menuForward.remove();
                },
                change: function(e, item) {
                    var value = item.value;
                    var vs = value.split("::");
                    $this.trigger("forwardItem", [$item, {type: vs[0], name: vs[1]}]);
                }
            });

            $item.addClass('state-forward');
            $menu.hide();
            $menuForward.show();
            $('#tada-forward').selectmenu('open');
        }, 10);
        
    });
}
