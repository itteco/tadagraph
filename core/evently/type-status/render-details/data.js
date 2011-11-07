function(e) {
    e.stopPropagation();
    
    var doc = $$(this).doc;
    
    var tagsDesc = API.tags.desc(API.filterPrepare({parent: doc}));
    var compactedTags = API.tags.compact(doc.tags, tagsDesc)
    var _badges = API.tags.extractBadges(compactedTags, tagsDesc);
    
    var badges = [];
    _badges.forEach(function(badge) {
        badges.push({
            type: badge
        });
    });
    
    var body = doc.body;
    if (doc.tags) {
        if (jQuery.inArray("dm", doc.tags) >= 0 && doc.db.type == "person") {
            if (doc.db.name != doc.created_by.id) {
                body = $.trim(body.replace(new RegExp("\\B@" + doc.db.name + "\\s*", "g"), ""));
            }
        }
    }
    
    var body;
    if (doc.tags && jQuery.inArray("note", doc.tags) > -1) {
        body = $$(document).showdown_converter.makeHtml(trimMeta(doc.body.replace(/\n/g, '\n\n')));
    } else {
        var result = prepareBody(body, doc, {
            hideFirstTags: badges.map(function(i) { return i.type; }),
            prependIntId: true
        });
        body = result.body;
    }
    
    var created_at = new Date(doc.created_at);
    
    // Show feed's owner.
    var hideCreator = false;
    var created_by = doc.created_by;
    if (created_by.id == "feeder") {
        // Detect feed sender (another user's feed).
        var owner = doc.owners || [];
        if (owner.length > 0) {
            owner = owner[0];
            // Do not show self as sender.
            if (owner.id == API.username()) {
                owner = null;
            } else {
                created_by = owner;
            }
        } else {
            owner = null;
        }
        if (!owner)
            hideCreator = true;
    }
    
    return {
        id: doc._id,
        _rev: doc._rev,
        hideCreator: hideCreator,
        created_by_id: created_by.id,
        creatorAvatar: API.avatarUrl(created_by.id),
        created_by_nickname: created_by.nickname,
        cdate: created_at.format('j F Y'),
        ctime: created_at.format("H:i"),
        editable: doc.created_by.id == API.username(),
        body: body,
        badge: badges,
        reply_to: doc.parent? doc.parent.created_by.nickname: '',
        reply_url: doc.parent? getUrlByFilter({db: doc.db, parentId: doc.parent._id }): '',
        reply_body: doc.parent? doc.parent.body.split('\n')[0]: "",
        attachments: API.prepare.attachments(doc),
        embedded_details: API.prepare.embedded_details(doc)
    };
}
