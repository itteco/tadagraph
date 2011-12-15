function(filter) {
    var topicId = filter.topicId || '';
    var tag = filter.tag || '';
    var nickname = filter.nickname || API.filterState['hide-others'] && (API.filterState['hide-others-list'] || API.username()) || '';
    var parentId = filter.parentId || '';
    
    var tagFilter = null;
    
    if (tag) {
        tagFilter = API.tags.filter(filter, tag);
        if (tagFilter) {
            tag = '';
        }
    }
    
    if (!tagFilter) tagFilter = function() { return true; }
    
    if (filter.topic) {
        topicId = filter.topic._id;
    }
    
    if (filter.parent) {
        parentId = filter.parent._id;
    }
    
    var data;
    if (topicId) {
        if (tag) {
            if (nickname) {
                data = cwByTopicTagNickname();

            } else {
                data = cwByTopicTag();
            }

        } else {
            if (nickname) {
                data = cwByTopicNickname();

            } else {
                data = cwByTopic();
            }
        }

    } else {
        if (tag) {
            if (nickname) {
                data = cwByTagNickname();

            } else {
                data = cwByTag();
            }

        } else {
            if (parentId) {
                data = cwByDoc();

            } else {
                if (nickname) {
                    data = cwByNickname();

                } else {
                    data = cwAll();
                }
            }
        }
    }
    
    function _inOwners(nickname, doc) {
        if (doc.owner && doc.owner.id == nickname)
            return true;

        if (doc.owners)
            for (var i = 0; i < doc.owners.length; i++)
                if (doc.owners[i].id == nickname)
                    return true;
        
        return false;
    }
    
    function _inTags(tag, doc) {
        return doc.tags && doc.tags.indexOf(tag) >= 0;
    }
    
    function cwAll() {
        return {
            view: {
                name: 'core/notifications',
                options: {
                    startkey: ['all', '\ufff0'],
                    endkey: ['all', 0],
                    include_docs: true
                }
            },
            filterCallback: function(doc) {
                return doc.type == 'status'
                    && tagFilter(doc);
            }
        };
    }
    
    function cwByDoc() {
        return {
            view: {
                name: 'core/notifications',
                options: {
                    startkey: ['doc', parentId, '\ufff0'],
                    endkey: ['doc', parentId, 0],
                    include_docs: true
                }
            },
            filterCallback: function(doc) {
                if (doc.type == 'status') {
                    for (var cursor = doc; cursor; cursor = cursor.parent) {
                        if (cursor._id == parentId) {
                            return tagFilter(doc);
                        }
                    }
                }
                return false;
            }
        };
    }
    
    function cwByNickname() {
        return {
            view: {
                name: 'core/notifications',
                options: {
                    startkey: ['user', nickname, '\ufff0'],
                    endkey: ['user', nickname, 0],
                    include_docs: true
                }
            },
            filterCallback: function(doc) {
                return doc.type == 'status' 
                    && _inOwners(nickname, doc)
                    && tagFilter(doc);
            }
        };
    }
    
    function cwByTag() {
        return {
            view: {
                name: 'core/notifications',
                options: {
                    startkey: ['tag', tag, '\ufff0'],
                    endkey: ['tag', tag, 0],
                    include_docs: true
                }
            },
            filterCallback: function(doc) {
                return doc.type == 'status'
                    && _inTags(tag, doc)
                    && tagFilter(doc);
            }
        };
    }
    
    function cwByTagNickname() {
        return {
            view: {
                name: 'core/notifications',
                options: {
                    startkey: ['tag-user', tag, nickname, '\ufff0'],
                    endkey: ['tag-user', tag, nickname, 0],
                    include_docs: true
                }
            },
            filterCallback: function(doc) {
                return doc.type == 'status'
                    && _inTags(tag, doc)
                    && _inOwners(nickname, doc)
                    && tagFilter(doc);
            }
        };
    }
    
    function cwByTopic() {
        return {
            view: {
                name: 'core/notifications',
                options: {
                    startkey: ['topic', topicId, '\ufff0'],
                    endkey: ['topic', topicId, 0],
                    include_docs: true
                }
            },
            filterCallback: function(doc) {
                return doc.type == 'status'
                    && API.topics.inTopic(doc, topicId)
                    && tagFilter(doc);
            }
        };
    }
    
    function cwByTopicNickname() {
        return {
            view: {
                name: 'core/notifications',
                options: {
                    startkey: ['topic-user', topicId, nickname, '\ufff0'],
                    endkey: ['topic-user', topicId, nickname, 0],
                    include_docs: true
                }
            },
            filterCallback: function(doc) {
                return doc.type == 'status' 
                    && API.topics.inTopic(doc, topicId)
                    && _inOwners(nickname, doc)
                    && tagFilter(doc);
            }
        };
    }
    
    function cwByTopicTag() {
        return {
            view: {
                name: 'core/notifications',
                options: {
                    startkey: ['topic-tag', topicId, tag, '\ufff0'],
                    endkey: ['topic-tag', topicId, tag, 0],
                    include_docs: true
                }
            },
            filterCallback: function(doc) {
                return doc.type == 'status'
                    && API.topics.inTopic(doc, topicId)
                    && _inTags(tag, doc)
                    && tagFilter(doc);
            }
        };
    }
    
    function cwByTopicTagNickname() {
        return {
            view: {
                name: 'core/notifications',
                options: {
                    startkey: ['topic-tag-user', topicId, tag, nickname, '\ufff0'],
                    endkey: ['topic-tag-user', topicId, tag, nickname, 0],
                    include_docs: true
                }
            },
            filterCallback: function(doc) {
                return doc.type == 'status'
                    && API.topics.inTopic(doc, topicId)
                    && _inTags(tag, doc)
                    && _inOwners(nickname, doc)
                    && tagFilter(doc);
            }
        };
    }
    
    return data;
}
