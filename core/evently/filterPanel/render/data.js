function() {
    var $$this = $$(this);
    
    var filters = $$this.filters;
    
    var items = [];
    $$this.filterInfo.forEach(function(info) {
        if (info.id in filters)
            items.push({
                id: info.id, 
                title: typeof info.title == "function"? info.title(): info.title, 
                checked: API.filterState[info.id], 
                disabled: filters[info.id].disabled,
                list: filters[info.id].list? {id: info.id + "-list", type: filters[info.id].list}: false
            });
    });
    
    var members = $$this.lists.members().map(function(member) {
        var person = API.profile(member);
        return person? {
            id: person.id, 
            nickname: person.nickname,
            avatar: API.avatarUrl(member)
        }: {
            id: member, 
            nickname: member,
            avatar: API.avatarUrl(member)
        };
    });
    
    return {
        show: items.length > 0,
        filters: items,
        members: members,
        id_rand: Math.floor(Math.random()*10000),
        search: API.filterState.search || ""
    }
}
