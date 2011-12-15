function(e) {
    e.stopPropagation();
    
    var profile = API.profile();
    
    return {
        username: profile.id,
        nickname: profile.nickname,
        avatar: API.avatarUrl(profile.id)
    };
}
