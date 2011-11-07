function(e) {
    e.stopPropagation();
    
    var $$this = $$(this);
    
    var doc = $$this.doc;
    var hideTopics = $$this.options.hideTopics || [];
    
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
    
    var compacted = doc.subtype == "changes" || doc.parent && trimMeta(doc.body) == "";
    
    if (compacted && doc.tags && doc.tags.length > 0) {
        badges.push({ type: doc.tags[0] });
    }
    
    // Make array of unique badges.
    // Do not modify 'badges' after this.
    var badgeDict = {};
    var badgesSet = [];
    badges.forEach(function(badge, idx) {
        if (!(badge.type in badgeDict)) {
            badgeDict[badge.type] = true;
            badgesSet.push(badge);
        }
    });
    badges = badgesSet;
    
    var result = prepareBody(body, doc, {
        hideFirstTags: badges.map(function(i) { return i.type; }),
        hideFirstReply: true,
        hideFirstIntId: true
    });
    
    var extraTags = compactedTags.filter(function(tag) {
        return !(tag in result.bodyTags) 
            && $.inArray(tag, _badges) == -1
            && !(tag in tagsDesc && tagsDesc[tag].hidden);
        
    }).map(function(tag) {
        return {tag: tag, url: getUrlByFilter({db: doc.db, tag: tag})};
    });
    
    var storedTopics = $$("#id_topics").storedTopics;
    var extraTopics = getDocTopics(doc).filter(function(topic) {
        return !(topic.title.toLowerCase() in result.bodyTopics) 
            && $.inArray(topic._id, hideTopics) == -1;
        
    }).map(function(topic) {
        topic = storedTopics[topic._id] || topic;
        return $.extend({}, topic, { url: getTopicUrl(topic) })
    });
    
    return {
        id: doc._id,
        created_by_id: doc.created_by.id,
        creatorAvatar: API.avatarUrl(doc.created_by.id),
        created_by_nickname: doc.created_by.nickname,
        created_at: API.formatShortDate(doc.created_at),
        body: result.body,
        reply_to: doc.parent? doc.parent.created_by.nickname: '',
        url: getUrlByFilter({db: doc.db, parentId: doc._id }),
        badge: badges,
        attachments: API.prepare.attachments(doc),
        usual_view: !compacted,
        special_view: compacted,
        hiddenTopics: extraTopics,
        hiddenTags: extraTags
    };
}
