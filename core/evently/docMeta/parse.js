function(e, value) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    var doc = $$this.doc;
    var meta = $$this.meta;
    
    var $input  = $('.input', this);
    if (!value) return;
    
    var tail = '';
    if (value.match(/[#@\[\$]$/)) {
        tail = value.charAt(value.length - 1);
        value = value.substr(0, value.length - 1);
    }
    $input.val(tail);
    
    API.filterTopics(getFilter(), function(_error, topics) {
        var topicsByTitle = {};
        $.forIn(topics, function(topicId, topic) {
            topicsByTitle[topic.title.toLowerCase()] = topic;
        });
        
        var changed = false;

        var tagsDesc = API.tags.desc(API.filterPrepare({parent: doc}));

        var tokens = lexStatusBody(value);
        tokens.forEach(function(token) {
            var exist = false;
            switch (token.t) {
                case "tag":
                    var tag = token.v.substr(1);
                    if (!doc.tags) doc.tags = [];
                    doc.tags = API.tags.add(tag, doc.tags, tagsDesc, function(tag, remove) {
                        changed = true;
                        API.tags.handle(tag, doc, remove? "remove": "add", tagsDesc);
                        $(document.body).trigger("entered-tag", [tag]);
                    });

                    var compactedTags = {};
                    API.tags.compact(doc.tags, tagsDesc).forEach(function(tag) {
                        if (!tagsDesc[tag] || !tagsDesc[tag].hidden)
                            compactedTags[tag] = true;
                    });

                    meta.forEach(function(i) {
                        if (i.type == "tag") {
                            if (i.id in compactedTags)
                                delete compactedTags[i.id];

                            else {
                                i.removed = true;
                            }
                        }
                    });
                    for (var _tag in compactedTags) {
                        meta.push({type: 'tag', id: _tag, label: '#' + _tag, added: true});
                    }
                    break;

                case "person":
                    var nickname = token.v.substr(1);
                    var person = API.profile(nickname) || {id: nickname, nickname: nickname};
                    meta.forEach(function(i) {
                        if (i.type == "member" && i.id == person.id) exist = true;
                    });
                    if (!exist) {
                        meta.push({type: 'member', id: person.id, label: '@' + person.nickname, added: true});
                        if (!doc.owners) doc.owners = [{id: person.id, nickname: person.nickname}];
                        else doc.owners.push({id: person.id, nickname: person.nickname});
                        changed = true;
                    }
                    break;

                case "topic":
                    addTopic(doc, token.v.substr(1, token.v.length - 2), function(topic) {
                        meta.push({type: 'topic', id: topic._id, label: topic.title, added: true});
                        changed = true;
                    });
                    break;

                case "num":
                    break;

                case "cp":
                    var cp = token.v.substr(1, token.v.length - 3);
                    doc.cp = parseInt(cp);
                    meta.forEach(function(i) {
                        if (i.type == "cp" && i.id == "cp") {
                            i.label = token.v;
                            exist = true;
                        }
                    });
                    if (!exist) {
                        meta.push({type: 'cp', id: "cp", label: token.v, added: true});
                        changed = true;
                    }
                    break;

                case "text":
                    var title = $.trim(token.v);
                    if (!title) break;
                    addTopic(doc, title, function(topic) {
                        meta.push({type: 'topic', id: topic._id, label: topic.title, added: true});
                        changed = true;
                    });
                    break;
            }
        });

        function addTopic(doc, title, callback) {
            var matchedTopic = topicsByTitle[title.toLowerCase()];

            var exist = false;
            if (matchedTopic) {
                var topic = matchedTopic;
                getDocTopics(doc).forEach(function(t) {
                    if (t._id == topic._id) {
                        t.title = title;
                        exist = true;
                    }
                });
                if (!exist) {
                    if (doc.topics) doc.topics.push(topic);
                    else doc.topics = [topic];
                    callback(topic);
                }

            } else {
                getDocTopics(doc).forEach(function(t) {
                    if (t.title.toLowerCase() == title.toLowerCase()) {
                        exist = true;
                    }
                });
                if (!exist) {
                    if (doc.topics) doc.topics.push({title: title});
                    else doc.topics = [{title: title}];
                    var id = new Date().getTime();
                    callback({id: "fake_" + id, title: title});
                }
            }
        }

        if (changed) {
            $this.trigger("render", [tail]);
            $this.trigger("save");
        }
    });
}
