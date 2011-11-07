function(e, id, value) {
    e.stopPropagation();
    
    var $this = $(this);
    
    API.filterState[id] = value;
    var idMatch = id.match(/^(.*)-list$/);
    if (idMatch) {
        API.filterState[idMatch[1]] = true;
        $this.find("[data-filter='" + idMatch[1] + "']").attr("checked", true);
    }
    
    if (id == "hide-others-list") {
        var person = API.profile(value) || { nickname: value };
        $this.find("[data-filter='" + id + "']").prev().text('@' + person.nickname);
    }
     
    setTimeout(function() {
        $this.trigger("filter-state-changed", [API.filterState, id]);
    }, 5);
}
