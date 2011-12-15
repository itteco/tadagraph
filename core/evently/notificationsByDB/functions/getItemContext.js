function(status, filter, topics) {
    var reply_to = "";

    var doc = status;
    var body = status.body;
    
    if (doc.parent && doc.parent.created_by) {
        if (doc.parent.created_by.nickname) {
            reply_to = doc.parent.created_by.nickname;
            
        } else {
            reply_to = doc.parent.created_by;
        }
    }
    
    var created_by_id,
        created_by_nickname;
    
    if (status.created_by.id && status.created_by.nickname) {
        created_by_id = status.created_by.id;
        created_by_nickname = status.created_by.nickname;
    } else {
        created_by_id = status.created_by;
        created_by_nickname = status.created_by;
    }
    
    var tagsDesc = API.tags.desc(API.filterPrepare({parent: doc}));
    var tags = doc.tags? doc.tags.slice(0): [];
    var compactedTags = API.tags.compact(tags, tagsDesc)
    var _badges = API.tags.extractBadges(compactedTags, tagsDesc);
    
    var flowView = null;
    var flowViewPriority = 0;
    
    compactedTags.forEach(function(tag) {
        var tagDesc = tagsDesc[tag];
        if (tagDesc && (tagDesc['flow-view'] || tagDesc['flow-view-priority']) && (flowViewPriority <= (tagDesc['flow-view-priority'] || 0))) {
            flowView = tagDesc['flow-view'];
            flowViewPriority = tagDesc['flow-view-priority'] || 0;
        }
    });
    
    var badges = [];
    _badges.forEach(function(badge) {
        badges.push({
            type: badge
        });
    });
    
    var published = false;
    var attachments = API.prepare.attachments(doc, {limit: 4});
    var embedded = API.prepare.embedded(doc);
    if (doc.tags) {
        if (jQuery.inArray("dm", doc.tags) >= 0 && status.db.type == "person") {
//            badges.push({type: "dm"});
            if (status.db.name != status.created_by.id) {
                body = $.trim(body.replace(/\B#dm\s*/g, "").replace(new RegExp("\\B@" + status.db.name + "\\s*", "g"), ""));
            }
        }
        
        if (jQuery.inArray("public", doc.tags) >= 0) {
            published = true;
        } else {
            attachments.images.forEach(function(image) {
                if (image.published)
                    published = true;
            });
            embedded.items.forEach(function(embed) {
                if (embed.published)
                    published = true;
            });
        }
    }
    
    var forwarded = false;
    if (doc.forwarded_info) {
        forwarded = true;
        badges.push({type: "fwd"});
    }
    
    if (doc.subtype == "changes") {
        flowView = 'compact';
        if (doc.tags && doc.tags.length > 0) {
            badges.push({type: doc.tags[0]});
        }
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
        hideFirstTags: badges.map(function(i) {return i.type;}),
        prependParentReply: true,
        prependIntId: false,
        hideFirstIntId: true,
        highlightTags: {
            nextweek: true,
            thismonth: true,
            thisweek: true,
            today: true,
            tomorrow: true
        },
        topics: topics
    });
    var renderedBody = result.body;
    
    var extraTags = compactedTags.filter(function(tag) {
        return !(tag in result.bodyTags) 
            && $.inArray(tag, _badges) == -1
            && !(tag in tagsDesc && tagsDesc[tag].hidden);
        
    }).map(function(tag) {
        return {tag: tag, url: getUrlByFilter({db: getFilter().db, tag: tag})};
    });
    
    var hideTopics = filter.topic? [filter.topic._id]: [];
    var extraTopics = getDocTopics(doc).filter(function(topic) {
        return !((topic.title || '').toLowerCase() in result.bodyTopics)
                && $.inArray(topic._id, hideTopics) == -1;
        
    }).map(function(topic) {
        topic = topics[topic._id] || topic;
        return $.extend({}, topic, {url: getTopicUrl(topic)})
    });
    
    var hiddenCp = false;
    if (doc.cp) {
        if (doc.body.search('\\$' + doc.cp + 'cp\\b') == -1)
            hiddenCp = doc.cp;
    }

    var db = status.db;
    var DB = API.filterDB({parent: doc});
    var spaceName = API.filterSpaceName(API.filterPrepare({parent: doc}));
    
    // TODO: need refactor 
    if (filter.tag == 'contact')
        flowView = 'contact';
    
    var intId = doc.intId || doc.parent && doc.parent.intId;
    if (renderedBody.indexOf("#" + intId) > -1) {
        intId = null;
    }
    
    spaceName = filter.db.name? null: spaceName;

    return {
        flowView: flowView,
        id: status._id,
        intId: intId,
        offline: !status._rev,
        created_by_id: created_by_id,
        creatorAvatar: API.avatarUrl(doc.created_by.id),
        created_by_nickname: created_by_nickname,
        
        myself: created_by_id == API.username() ||
                created_by_nickname == API.username(),
        
        type: doc.type,
        badge: badges,
        body: renderedBody,
        created_at: API.formatShortDate(status.created_at),
        created_at_orig: API.parseDate(status.created_at)
                            .toLocaleString(),
        reply_to: reply_to,
        reply_url: getUrlByFilter({parent: doc.parent}),
        enable_reply: db? db.type != "person": false,
        spaceName: spaceName,
        showMeta: spaceName || reply_to,
        spaceUrl: getUrlByFilter({db: db}),
        attachments: attachments,
        embedded: embedded,
        docId: doc._id,
        docUrl: getUrlByFilter({parent: doc}),
        isNew: API.isViewed && !API.isViewed(status) && status._rev && true || false,
        forwarded: forwarded,
        forwarded_by_id: forwarded && doc.forwarded_info.by.id,
        forwarderAvatar: forwarded && API.avatarUrl(doc.forwarded_info.by.id),
        hiddenTopics: extraTopics,
        hiddenTags: extraTags,
        hiddenCp: hiddenCp,
        space: {
            'private': db.type == 'person',
            type: 'space ' + db.type,
            name: DB.name
        },
        published: published
    };
}
