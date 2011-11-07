function(e) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    API.connectVisible(document.body, $this, ["setFilter"]);
    
    // Disabled to work in contact popup.
    /*
    $(document.body).bind('click', function(e) {
        if ($this.is(":visible")) {
            var $e = $(e.target);
            var owner = $e.data('owner');
            if (owner) {
                $this.trigger("select-filter", ["hide-others-list", owner]);
            }
        }
    });
    */
    
    $$this.filterInfo = [
        {id: "hide-others", title: function() {
            var ownerId = API.filterState["hide-others-list"] || API.username();
            var owner = API.profile(ownerId) || { nickname: ownerId };
            return "@" + owner.nickname;
        }},
        {id: "hide-unstarred", title: "starred", persistable: true},
        {id: "hide-done", title: "hide done"},
        {id: "hide-archived", title: "hide archived"},
        {id: "hide-empty", title: "hide empty lists"},
        {id: "hide-later", title: "hide later"},
        {id: "hide-read", title: "unread"},
        {id: "show-following", title: "following"},
        {id: "show-followers", title: "followers"},
        {id: "show-project-peers", title: "project peers"},
        {id: "show-team-peers", title: "team mates"},
        {id: "show-location-peers", title: "co-workers"}
    ];
    
    $$this.lists = {};
    
    $$this.lists.members = function() {
        var space = API.filterSpace(getFilter());
        return space? space.allMembers || []: [];
    }
    
    $$this.dialogs = {};
    
//    $this.trigger("reset", [getFilter()]);
//    $this.trigger("render");
    
    $this.bind("change", function(e) {
        e.stopPropagation();
        
        var $filter = $(e.target);
        var filter = $filter.data('filter');
        if (filter)
            $this.trigger("select-filter", [filter, e.target.checked]);
    });
}
