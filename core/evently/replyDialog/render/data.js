function(e) {
    e.stopPropagation();
    
    var profile = API.profile();
    
    return {
        nickname: profile.nickname,
        avatar: API.avatarUrl(profile.id)
    };
}
