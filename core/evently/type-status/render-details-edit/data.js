function(e) {
    e.stopPropagation();
    
    var doc = $$(this).doc;
    
    var body = doc.body;

    var created_at = new Date(doc.created_at);
    
    return {
        id: doc._id,
        _rev: doc._rev,
        created_by_id: doc.created_by.id,
        creatorAvatar: API.avatarUrl(doc.created_by.id),
        created_by_nickname: doc.created_by.nickname,
        cdate: created_at.format('j F Y'),
        ctime: created_at.format("H:i"),
        body: body,
        reply_to: doc.parent? doc.parent.created_by.nickname: '',
        reply_url: doc.parent? getUrlByFilter(API.filterPrepare({parent: doc.parent })): '',
        attachments: API.prepare.attachments(doc)
    };
}
