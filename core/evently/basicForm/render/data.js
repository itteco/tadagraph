function(e, spaces) {
    var $this = $(this);
    var $$this = $$(this)
    
    var selected = $$this.currentDB;
    
    spaces = spaces
        .filter(function(s) { return s._active; })
        .map(function(s) {
            return {
                id: s.type + "::" + s.id,
                name: s.name || s.id,
                type: s.type,
                selected: selected && selected.type == s.type && selected.name == s.id
            }
        });
    
    if (spaces.length == 1) {
        spaces[0].selected = true;
        $$this.currentDB = {type: spaces[0].type, name: spaces[0].id};
    }
    
    var profile = API.profile();
    var contactHistory = getFilter().view == 'contact-history';
    
    return {
        contact: contactHistory && {
          owner: getFilter().nickname == API.username()
        },
        username: profile["id"],
        nickname: profile.nickname,
        avatar: API.avatarUrl(profile.id),
        noneSpaceSelected: !selected || !(selected.name),
        spaces: spaces && spaces.map(function(space) {
            return {
                id: space.id,
                type: space.type,
                name: space.name,
                selected: space.selected
            };
        }),
        showSpaces: !($$this.inline || contactHistory) && spaces.length > 1,
        showHelp: !$$().get('core:basicForm:statusMessageClosed')
    };
}
