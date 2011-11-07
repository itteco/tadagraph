function(e, filter) {
    e.stopPropagation();
    
    var $$this = $$(this);
    
    $$this.filter = filter;
    $$this.view = getMenuItem(filter, filter.view) || {};
    
    var filters = API.getMenuItemFilters($$this.view, filter);
    $$this.filters = {};
    
    var state = {};
    if (filter.view === "search")
        state.search = API.filterState.search;
    
    for (var f in filters) {
        if (typeof filters[f] == "object") {
            $$this.filters[f] = filters[f];
            
        } else {
            $$this.filters[f] = {
                checked: filters[f]
            };
        }
        var fs = API.filterState[f];
        state[f] = typeof fs == "boolean"? fs: ($$this.filters[f].checked || false);
        if ($$this.filters[f].disabled)
            state[f] = $$this.filters[f].checked || false;
        
        if ($$this.filters[f].list) {
            var list = $$this.filters[f].list;
            var values = $$this.lists[list]();
            var value = API.filterState[f + "-list"];
            if (value && jQuery.inArray(value, values) >= 0) {
                state[f + "-list"] = value;
                
            } else {
                state[f + "-list"] = API.username();
                // This was conflicting with checked=true from settings json.
                //state[f] = false;
            }
        }
    }
    
    $$this.filterInfo.forEach(function(info) {
        var f = info.id;
        if (info.persistable && !(f in state)) {
            var fs = API.filterState[f];
            state[f] = typeof fs == "boolean"? fs: false;
        }
    });
    
    
    API.filterState = state;
}
