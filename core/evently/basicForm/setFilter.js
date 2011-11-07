function(e, filter) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    if ($this.is(':visible')) {
        var $form       = $this.children('.status-form');
        var $spacebox   = $form.find('.spacebox');

        if (!$$this.inline) {
            var space = filter.db;
            $spacebox.selectmenu('value', (space.type && space.name)? (space.type + "::" + space.name): "");
        }    

        var oldDb = $$this.currentDB;
        $$this.currentDB = filter.db;

        $this.trigger("spaceChanged", [$this, filter.db, oldDb]);

        // Clear reply if project changed.
        if ($$this.replyTo && 
            (
            $$this.replyTo.db.type != filter.db.type || 
            $$this.replyTo.db.name != filter.db.name)) {

            $this.trigger("clearReply");
        }

        if ($$this.contact != (filter.view == 'contact') || $this.data('need-reload')) {
            API.filterSpaces(function(spaces) {
                if (spaces.length == 1) {
                    $$this.currentDB = {type: spaces[0].type, name: spaces[0].id};
                }
                $this.trigger("render", [spaces]);
            });
        }

        $this.data('need-reload', false);
        $$this.contact = filter.view == 'contact'; 
    }
}
