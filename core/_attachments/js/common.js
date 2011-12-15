/* -- -- -- -- -- -- -- -- -- -
 *    Global constants
 * -- -- -- -- -- -- -- -- --*/

var LANGUAGE = "en";
var DAY_MILISECONDS = 60 * 60 * 24 * 1000;
var UNREAD_ACTUALITY_PERIOD = DAY_MILISECONDS * 2;

// Global error level constants
var LogLevel = {FATAL:-2, ERROR:-1, WARN:0, INFO:1, DEBUG:2};


/*
 * -- -- -- -- -- -- -- -- -- - CouchApps -- -- -- -- -- -- -- -- --
 */

// TODO design - create singleton objects to aggregate static methods?
// Global couch apps list, filled with main.js.
var APPS = {};

function forEachApp(callback) {
    for (var appName in APPS) {
        callback(APPS[appName], appName);
    }
}

function runExtention(filter, extention, args) {
    API.forEachApp(filter, function(app, appName) {
        if (app.ddoc.extentions && extention in app.ddoc.extentions) {
            var ext = app.ddoc.extentions[extention];
            if (typeof ext == 'object') {
                $.forIn(ext, function(id, func) {
                    runIfFun2(func, args);
                });
                
            } else {
                runIfFun2(ext, args);
            }
        }
    });
}




/*
 * -- -- -- -- -- -- -- -- -- - Window -- -- -- -- -- -- -- -- --
 */

	$(window).bind('asyncload', function() {
	  // jReject
	  if ($.reject) {
	    $(function() {
	      $.reject({
	        reject: {
              all: false,  
	          msie: true,
	          opera: true,
	          firefox: false, firefox1: true, firefox2: true, firefox3: true 
	        },
	        display: [
	          'chrome',
	          'firefox',
	          'safari',
	          'gcf'
	        ],
	        browserInfo: {
	          firefox: {
	            text: 'Get latest Firefox', // Text below the icon
	            url: 'http://www.mozilla.com/firefox/'
	          },
	          chrome: {
	            text: 'Get latest Chrome',
	            url: 'http://www.google.com/chrome/'
	          },
	          safari: {
	            text: 'Get latest Safari',
	            url: 'http://www.apple.com/safari/download/'
	          },
	          gcf: {
	            text: 'Get Google Chrome Frame for IE',
	            url: 'http://code.google.com/chrome/chromeframe/',
	            allow: {all: false, msie: true} // This browser option will
													// only be displayed for
													// MSIE
	          }
	        },
	        imagePath: '/pub/images/browsers/',
	        header: 'Heads up: you browser/version is not supported (yet)...',
		    paragraph1: 'Team.FM is loaded with HTML5 and so does provide excellent user experience in some browsers.',
		    paragraph2: 'We prefer Google Chrome ourselves, but the other ones from list below work great too.',
	    	close: true,
		    closeMessage: 'Well, we warned you...'
	      });
	    });
	  }
	});


/*
 * -- -- -- -- -- -- -- -- -- - Others -- -- -- -- -- -- -- -- --
 */

var TODO_BACKLOG_TOPIC = {
    _id: "later",
    title: "Later"
};

var NO_TOPIC = {
    _id: "no-topic",
    title: "No topic"
};

function getPrefixMatchByDBType(type) {
    switch(type) {
        case "team":return "+";
        case "location":return "-";
        case "person":return "~";
        default:return "";
    }
}

// Shortcut for attaching parrent document to target.
function attachReply(doc, replyTo) {
    if (replyTo && doc.db.name == replyTo.db.name) {
        doc.parent = replyTo;

        var topics = [];
        if (doc.parent.topics) {
            topics = topics.concat(doc.parent.topics);
        }

        if (doc.parent.topic) {
            topics.push(doc.parent.topic);
        }

        topics.forEach(function(topic) {
            if (!API.topics.inTopic(doc, topic._id)) {
                if (doc.topics)
                    doc.topics.push(topic);

                else
                    doc.topics = [topic];
            }
        });

        var ownerExists = false;
        doc.owners.forEach(function(owner) {
            if (owner.id == doc.parent.created_by.id)
                ownerExists = true;
        });
        if (!ownerExists)
            doc.owners.unshift(doc.parent.created_by);

        API.tags.handleTags(doc.parent.tags, doc, "parent");
    }
}

function createTopic(DB, topic, callback, fastCreateCallback) {
    var profile = API.profile();
    topic = $.extend(true, topic, {
        _id: topic._id || $.couch.newUUID(),
        db: {
            name: DB.name,
            type: DB.type
        },
        type: "topic",
        ver: 1,
        created_at: new Date(),
        created_by: {
            id: profile.id,
            nickname: profile.nickname
        }
    });

    if (fastCreateCallback)
        fastCreateCallback(topic);

    DB.saveDoc(topic, {
        success: function() {
            callback(topic);
        }
    });
}

function storeTopics(DB, topics, options) {
    if (!topics) {
        options.success();
        return;
    }

    var titles = [];
    var titlesIndex = {};
    var i = 0;
    while (i < topics.length) {
        var topic = topics[i];
        var title = (topic.title || '').toLowerCase();
        if (!(title in titlesIndex)) {
            titles.push(title);
            titlesIndex[title] = i;
            i++;
        } else {
            // Remove duplicate topics.
            topics.splice(i, 1);
        }
    }

    if (titles.length == 0) {
        options.success();
        return;
    }

    var keys = [];
    titles.forEach(function(title) {
        keys.push([DB.type, DB.name, title.toLowerCase()]);
    });

    DB.view("core/topics", {
        keys: keys,
        include_docs: true,
        success: function(data) {
            var changedTopics = [];
            data.rows.forEach(function(row) {
                var currentTopic = row.doc;
                var oldTopic = topics[titlesIndex[row.key[2]]];
                var updated = false;

                if (oldTopic.tags && !options.doNotChangeExistingTopicTags) {
                    var differs = true;
                    var tags = {};
                    if (currentTopic.tags) {
                        oldTopic.tags.sort();
                        currentTopic.tags.sort();
                        if (JSON.stringify(oldTopic.tags) == JSON.stringify(currentTopic.tags)) {
                            differs = false;
                        }
                        if (differs) {
                            currentTopic.tags.forEach(function(tag) {
                                tags[tag] = true;
                            });
                        }
                    }
                    if (differs) {
                        oldTopic.tags.forEach(function(tag) {
                            tags[tag] = true;
                        });
                        currentTopic.tags = [];
                        for(var tag in tags) {
                            currentTopic.tags.push(tag);
                        }
                        updated = true;
                    }
                }

//                if (currentTopic.archived) {
//                    // Unarchive existing topic.
//                    currentTopic.archived = false;
//                    updated = true;
//                }
//
                if (updated) {
                    changedTopics.push(currentTopic);
                }
                topics[titlesIndex[row.key[2]]] = currentTopic;
            });
            var profile = API.profile();
            var newTopics = topics.filter(function(topic) {
                return !topic._id;
            }).map(function(topic) {
                return $.extend(topic, {
                    db: {
                        name: DB.name,
                        type: DB.type
                    },
                    type: "topic",
                    ver: 1,
                    created_at: new Date(),
                    created_by: {
                        id: profile.id,
                        nickname: profile.nickname
                    }
                });
            });

            newTopics = newTopics.concat(changedTopics);
            if (newTopics.length > 0) {
                DB.bulkSave(newTopics, {
                    success: function(result) {
                        result.forEach(function(r, i) {
                            $.extend(topics[titlesIndex[(newTopics[i].title || '').toLowerCase()]], {
                                _id: r.id,
                                _rev: r.rev
                            });
                        });
                        options.success();
                    },
                    error: function(status, error, reason) {
                        options.error(status, error, reason);
                    }
                });

            } else {
                options.success();
            }
        },
        error: function(status, error, reason) {
            options.error(status, error, reason);
        }
    });

}

function getPossibleTopicTagsToAdd(topic) {
    var filter = API.filterPrepare({topic: topic});
    var tags = API.getTopicTags(filter);
    var result = [];
    if (tags) {
        tags.forEach(function(tag) {
            if (!topic.tags || jQuery.inArray(tag, topic.tags) == -1) {
                result.push(tag);
            }
        });
    }
    return result;
}

/*
 * Shourcut for creating widget helper functions, extracted from
 * widget.functions folder. Call it in "_init" event.
 *
 * Example:
 *
 * _design/evenly/functions/myFunc.js
 *
 * will be accessible through
 *
 * $$(this).functions.myFunc()
 */
function extractWidgetFunctions(widget) {
    if ($$(widget).evently.functions) {
        $$(widget).functions = {};
        for(var func in $$(widget).evently.functions) {
            var fn = eval("var __f = " + $$(widget).evently.functions[func] + ";\n__f");
            $$(widget).functions[func] = fn;
        }
    }
}

// Public. Returns topic url.
function getTopicUrl(topic) {
    var url;
    if (topic && topic.db) {
        switch (topic.db.type) {
            case "project":
            case "team":
            case "localtion":
            case "person":
                url = getUrlByFilter({topic: topic});
                break;

            default:
                url = "javascript:void(0);";
        }

    } else
        url = "javascript:void(0);";

    return url;
}

var TRIM_META_PATTERN_START = /^(\[[^\[]+\]|@[\w\d-_]+|#[\w\d-_]+|\$\d+cp|\s)+/gi;
var TRIM_META_PATTERN_END = /(\[[^\[]+\]|@[\w\d-_]+|#[\w\d-_]+|\$\d+cp|\s)+$/gi;
function trimMeta(body) {
    if (body)
        return body.replace(TRIM_META_PATTERN_START, "").replace(TRIM_META_PATTERN_END, "");
    else
        return "";
}

var TRIM_SENTENCE = /^[^.!?]+.?/gi;
function trimFirstSentence(body) {
    return (body.match(TRIM_SENTENCE) || [""])[0];
}

function lexStatusBody(body) {
    var tokens = [];
    var i = 0;
    var prevIsSeparator = true;
    var previ = 0;

    function process(rest, re, t) {
        match = rest.match(re);
        if (match) {
            if (previ < i) {
                tokens.push({t: "text", v: body.substr(previ, i - previ)});
            }

            tokens.push({t: t, v: match[1]});
            previ = i + match[1].length;
            i = previ - 1;
            prevIsSeparator = true;

            return true;
        }

        return false;
    }

    for (; i < body.length; i++) {
        switch (body.charAt(i)) {
            case '"':
                var j = body.indexOf('"', i + 1);
                if (j >= 0) {
                    i = j;
                    prevIsSeparator = false;
                }
                break;

            case '\n':
                if (previ < i) {
                    tokens.push({t: "text", v: body.substr(previ, i - previ)});
                }
                previ = i + 1;
                tokens.push({t: "newline"});
                prevIsSeparator = true;
                break;

            case '\t':
            case ' ':
            case '.':
            case ',':
            case '!':
            case '?':
            case '(':
            case ')':
            case '{':
            case '}':
                prevIsSeparator = true;
                break;

            default:
            if (prevIsSeparator) {
                prevIsSeparator = false;
                var rest = body.substr(i);
                var match;
                switch (body.charAt(i)) {
                    case '#':
                        if (process(rest, /^(#\d+)(?=(?:$|[\s\.,!?(){}]))/, "num"))
                            break;

                        process(rest, /^(#[\w\-]+)(?=(?:$|[\s\.,!?(){}]))/, "tag");
                        break;

                    case '[':
                        process(rest, /^(\[[^\]\[\n]+\])(?=(?:$|[\s\.,!?(){}]))/, "topic");
                        break;

                    case '$':
                        process(rest, /^(\$\d+cp)(?=(?:$|[\s\.,!?(){}]))/, "cp");
                        break;

                    case '@':
                        process(rest, /^(@[\w\-]+)(?=(?:$|[\s\.,!?(){}]))/, "person");
                        break;

                    case 'h':
                        process(rest, /^(https?:\/\/[^\s]+[^\s\.,!?(){}])(?=(?:$|[\s\.,!?(){}]))/, "link");
                        break;
                }
            }
        }
    }

    if (previ < i) {
        tokens.push({t: "text", v: body.substr(previ, i - previ)});
    }

    return tokens;
}

function prepareBody(body, doc, options) {
    options = options || {};
    
    var hideTopics = options.hideTopics || options.hideMeta || false;
    var hideTags = options.hideTags || options.hideMeta || false;
    var hideOwners = options.hideOwners || options.hideMeta || false;
    var hideLinks = options.hideLinks || false;
    var topics = options.topics || {};

    var tokens = lexStatusBody(body);

    // extact body meta
    var bodyTags = {};
    var bodyOwners = {};
    var bodyTopics = {};
    var bodyIntId = false;
    var bodyParentOwner = false;
    tokens.forEach(function(token) {
        switch (token.t) {
            case "person":
                if (hideOwners) break;
                var nickname = token.v.substr(1);
                token.p = nickname;
                var person = API.profile(nickname) || {id: nickname};
                bodyOwners[person.id] = true;
                if (doc.parent && person.id == doc.parent.created_by.id)
                    bodyParentOwner = true;
                break;

            case "tag":
                if (hideTags) break;
                var tag = token.v.substr(1);
                token.p = tag;
                bodyTags[tag] = true;
                break;

            case "topic":
                if (hideTopics) break;
                var title = token.v.substr(1, token.v.length - 2).toLowerCase();
                token.p = title;
                bodyTopics[title] = true;
                break;

            case "num":
                bodyIntId = true;
                token.p = token.v.substr(1);
                break;
        }
    });

    var intId = doc.intId || doc.parent && doc.parent.intId;

    // hide first meta
    var hide = {};

    if (options.hideFirstTags)
        hide["tag"] = options.hideFirstTags;

    if (options.hideFirstTopics) {
        hide["topic"] = options.hideFirstTopics;
    }

    if (doc.parent) {
        if (options.hideFirstReply || doc.parent.created_by.id == doc.created_by.id)
            hide["person"] = [doc.parent.created_by.nickname];
    }

    if (options.hideFirstIntId && intId && doc.parent) {
        hide["num"] = [doc.parent.intId + ''];
    }

    while (tokens.length > 0) {
        var values = hide[tokens[0].t];
        if (values && (typeof values == 'boolean' || jQuery.inArray(tokens[0].p, values) >= 0)) {
            tokens.shift();
            while (tokens.length > 0 && tokens[0].t == "text" && $.trim(tokens[0].v) == "")
                tokens.shift();

        } else break;
    }

    if (!tokens || tokens.length == 0 || tokens[0].t != "person") {
        var ownerPrepended = false;

        if (doc.owner && !(doc.owner.id in bodyOwners)) {
            ownerPrepended = true;
            tokens.unshift({t: "person", v: "@" + doc.owner.nickname, p: doc.owner.nickname});
        }

        // prepend/remove reply/num
        if (!ownerPrepended && options.prependParentReply && doc.parent && doc.parent.created_by.id != doc.created_by.id && !bodyParentOwner) {
            ownerPrepended = true;
            tokens.unshift({t: "person", v: "@" + doc.parent.created_by.nickname, p: doc.parent.created_by.nickname});
        }
    }

    if (options.prependIntId && !bodyIntId && intId) {
        tokens.unshift({t: "num", v: "#" + intId, p: intId});
    }

    // render body
    var docTags = {};
    if (doc.tags) doc.tags.forEach(function(tag) {docTags[tag] = true;});

    var docTopics = {};
    if (doc.topic) {
      docTopics[(doc.topic.title || '').toLowerCase()] = doc.topic;
    }

    if (doc.topics) {
      doc.topics.forEach(function(topic) {
        docTopics[(topic.title || '').toLowerCase()] = topic;
      });
    }

    var docOwners = {};
    if (doc.owner) docOwners[doc.owner.id] = doc.owner;
    if (doc.owners) doc.owners.forEach(function(owner) {docOwners[owner.id] = owner;});

    var highlightTags = options.highlightTags || {};

    var result = '';

    var currentDomain = document.location.href.split("/").slice(0, 3).join("/");

    var embedUrls = {};
    if (doc.embedded) {
        doc.embedded.forEach(function(doc) {
            if (doc.preview)
                embedUrls[doc.preview.original_url] = true;
        });
    }

    tokens.forEach(function(token) {
        switch (token.t) {
            case "text":
                result += $.mustache("{{text}} ", {text: $.trim(token.v)});
                break;

            case "newline":
                result += "<br /> ";
                break;

            case "person":
                if (hideOwners) break;
                var nickname = token.p;
                var person = API.profile(nickname) || {id: nickname, nickname: nickname};
                if (person.id in docOwners) {
                    result += $.mustache('<a href="#" onclick="return false" data-owner="{{id}}">@{{nickname}}</a> ', {
                        id: person.id,
                        nickname: nickname
                    });

                } else {
                    result += $.mustache("{{text}} ", {text: $.trim(token.v)});
                }
                break;

            case "tag":
                if (hideTags) break;
                var tag = token.p;
                if (tag in docTags || highlightTags[tag]) {
                    result += $.mustache('<a data-tag="{{tag}}" href="{{url}}">#{{tag}}</a> ', {
                        tag: tag, url: getUrlByFilter({db: getFilter().db, tag: tag})
                    });

                } else {
                    result += $.mustache("{{text}} ", {text: $.trim(token.v)});
                }
                break;

            case "topic":
                if (hideTopics) break;
                var topic = docTopics[token.p.toLowerCase()];
                if (topic) {
                    result += $.mustache('<a href="{{url}}">[{{topic}}]</a> ', {
                        topic: (topics[topic._id] || topic).title,
                        url: getTopicUrl(topic)
                    });

                } else {
                    result += $.mustache("{{text}} ", {text: $.trim(token.v)});
                }
                break;

            case "link":
                if (hideLinks) break;
                var url = token.v;
                
                if (url in embedUrls) {
                    // Skip embed url.
                } else if (url.indexOf(currentDomain) == 0) {
                    result += $.mustache('<a href="{{link}}">{{link}}</a> ', {
                        link: url
                    });
                } else {
                    result += $.mustache('<a href="{{link}}" target="_blank">{{link}}</a> ', {
                        link: url
                    });
                }
                break;

            case "num":
                result += $.mustache('<a href="{{url}}">{{tag}}</a> ', {
                    tag: token.v, url: getUrlByFilter({db: doc.db, parentId: token.v, view: "details"})
                });
                break;

            default:
                result += $.mustache("{{text}} ", {text: $.trim(token.v)});
                break;
        }
    });
    
    // Detect empty message with linebreaks.
    var truncTest = $.trim(result.replace(/<br \/> /gi, ""));
    if (!truncTest)
        result = truncTest;
    
    return {
        body: result,
        bodyIntId: bodyIntId,
        bodyTags: bodyTags,
        bodyTopics: bodyTopics,
        bodyOwners: bodyOwners
    };
}

function applyThumbs($selector) {
    // attachment preview
    $selector.find(".attachment a.sys-thumb").fancybox({
        transitionIn    : 'elastic',
        transitionOut   : 'fade',
        speedIn         : 400,
        speedOut        : 200,
        overlayShow     : true,
        overlayOpacity  : 0,
        centerOnScroll  : true,
        scrolling       : 'no',
        cyclic          : true
    });
    
    $selector.find('.attachment.video .attach-image a').click(function(event){
        var $link  = $(this);
        var $image = $link.parent();
        var $html  = $image.next();
        $html.height($image.height());
        $html.width($image.width());
        $image.hide();
        $html.find('embed, object, iframe').attr('width','100%').attr('height','100%').attr('wmode','transparent');
        $html.show();
        event.preventDefault();
    });
}

/*
 * Doc delete logic.
 */

// Load all documents' children.
function loadDocumentsToDelete(doc, callback) {
    var DB = API.filterDB({parent: doc});
    DB.view("core/docs-to-delete", {
        startkey: doc._id,
        endkey: doc._id,
        include_docs: true,
        success: function(data) {
            var docs = data.rows.map(function(row) {return row.doc});
            callback(docs);
        }
    });
}

/*
 * Filtration / navigation.
 */

var CURRENT_FILTER = API.filterPrepare();

function getFilter() {
    return CURRENT_FILTER;
}

function setFilter(filter) {
    var oldFilter = CURRENT_FILTER;
    CURRENT_FILTER = API.filterPrepare(filter);

    $(document.body).trigger("setFilter", [CURRENT_FILTER, oldFilter]);
}

function getUrlByFilter(filter) {
    API.filterPrepare(filter);

    var tag = filter.tag;

    var url = "#";

    url += API.filterPrefix(filter);

    if (filter.db.name) {
        if (filter.topicId || filter.topicIds) {
            if (filter.topicIds) {
                filter.topicIds.forEach(function(topicId) {
                    url += topicId + "/";
                });
            } else {
                url += filter.topicId + "/";
            }
        } else if (filter.parentId) {
            if (filter.parent && filter.parent.intId && (typeof(filter.parent.intId) == 'number')) {
                url += "#" + filter.parent.intId + "/";
            } else {
                url += filter.parentId + "/";
            }
        }
    }

    if (filter.view) {
        var view = getMenuItem(filter, filter.view);
        if (!view || !view['default'])
            url += filter.view + "/";
    }

    if (tag)
        url += "#" + tag + "/";

    return url;
}

function getFilterWithDB(afilter, db) {
    var filter = $.extend(true, {}, afilter);
    if (!filter.db.name || filter.db.name != db.name || filter.db.type != db.type) {

        if (filter.tag == 'contact' || filter.tag == 'contacts') {
          delete filter.tag;
          delete filter.nickname;
        }

        filter["db"] = db;
        filter.topicId = "";
        filter.topicIds = null;
        filter.parentId = "";
        delete filter["topic"];
        delete filter["parent"];
    }
    return filter;
}

function getFilterWithoutDB(afilter) {
    var filter = $.extend(true, {}, afilter);

    filter.db.name = "";
    filter.topicId = "";
    filter.topicIds = null;
    filter.parentId = "";
    filter.tag = "";
    delete filter["topic"];
    delete filter["parent"];
    return filter;
}

function getFilterWithTopic(afilter, topic, multipleTopics) {
    var filter = $.extend(true, {}, afilter);
    if (multipleTopics) {
        // This is set up for todo multitopics page.
        if (!filter.topicIds || $.inArray(topic._id, filter.topicIds) == -1) {
            if (!filter.topicIds)
                filter.topicIds = [];
            filter.topicIds.push(topic._id);
        }
    } else if (!filter.topicId || filter.topicId != topic._id) {
        filter.topic = topic;
        filter.db = topic.db || afilter.db;
        filter.topicId = topic._id;
        filter.parentId = "";
        delete filter["parent"];
        delete filter["topicIds"];
    }
    return filter;
}

function getFilterWithoutTopic(afilter, topic) {
    var filter = $.extend(true, {}, afilter);
    filter.topicId = "";
    filter.parentId = "";

    if (!filter.db.name) {
        filter.tag = "";
    }

    delete filter["topic"];

    if (filter.topicIds) {
        var idx = $.inArray(topic._id, filter.topicIds);
        if (idx > -1) {
            filter.topicIds.splice(idx, 1);
        }
    }

    return filter;
}

function getFilterWithTag(afilter, tag) {
    var filter = $.extend(true, {}, afilter);
    if (!filter.tag || filter.tag != tag) {
        filter.tag = tag;
        filter.parentId = "";
        delete filter["parent"];
//
// if (!filter.db.name) {
// alert("Can't filter by tag without project.");
// }
    }
    return filter;
}

function getFilterWithoutTag(afilter) {
    var filter = $.extend(true, {}, afilter);
    filter.tag = "";
    return filter;
}

function getFilterWithoutNickname(afilter) {
    var filter = $.extend(true, {}, afilter);
    filter.nickname = "";
    return filter;
}

function getFilterWithNickname(afilter, nickname) {
    var filter = $.extend(true, {}, afilter);
    filter.nickname = nickname;
    filter.parentId = "";
    delete filter["parent"];
    return filter;
}

// TODO: weird function interface.
function createStatus(DB, body, creator, options, callback) {
    var db = {name: DB.name, type: DB.type};
    var filter = {db: db};
    options = options || {};

    var status = {
        _id: $.couch.newUUID(),
        db: db,
        type: "status",
        ver: 1,
        created_at: new Date(),
        created_by: {
            id: creator['id'],
            nickname: creator.nickname
        },
        body: body
    };

    var owners = [];
    var ownerDict = {};
    var tags = [];
    var topics = [];
    var topicsEntered = [];
    var topicTitleDict = {};
    var nums = [];
    var links = [];

    // apply preset meta
    if (options.tags) {
        options.tags.forEach(function(tag) {
            if ($.inArray(tag, tags) == -1)
                tags.push(tag);
        });
    }

    if (options.topics) {
        options.topics.forEach(function(topic) {
            if (!((topic.title || '').toLowerCase() in topicTitleDict)) {
                topics.push(topic);
                topicTitleDict[(topic.title || '').toLowerCase()] = true;
            }
        });
    }

    var $body = $(document.body);
    // apply body meta
    var tokens = lexStatusBody(status.body);
    tokens.forEach(function(token) {
        switch (token.t) {
            case "tag": {
                    var tag = token.v.substr(1);
                    if ($.inArray(tag, tags) == -1) {
                        tags.push(tag);
                        $body.trigger("entered-tag", [tag]);
                    }
                    break;
            }

            case "person": {
                    var nickname = token.v.substr(1);
                    var person = API.profile(nickname);
                    if (person && !ownerDict[person.id]) {
// status.privacy = "owners";
                        ownerDict[person.id] = true;
                        owners.push({
                            id: person.id,
                            nickname: person.nickname
                        });
                    }

                    break;
            }

            case "cp": {
                    var cp = token.v.substr(1, token.v.length - 3);
                    status.cp = parseInt(cp);
                    break;
            }

            case "num": {
                    var num = parseInt(token.v.substr(1));
                    if (nums.indexOf(num) == -1)
                        nums.push(num);
                    break;
            }

            case "topic": {
                    var title = token.v.substr(1, token.v.length - 2);
                    if (!(title.toLowerCase() in topicTitleDict)) {
                        var topic = {title: title}

                        topics.push(topic);
                        topicsEntered.push(topic);
                        topicTitleDict[title.toLowerCase()] = true;
                    }
                    break;
            }

            case 'link': {
                var url = token.v;
                if (links.indexOf(url) == -1)
                    links.push(url);
            }
        }
    });

    // apply post meta
    if (!(API.username() in ownerDict)) { // add creator to owners
        var person = API.profile(API.username());
        owners.push({
            id: person.id,
            nickname: person.nickname
        });
    }

    status.owners = owners;

    // Assign app tags to only one entered topic OR one topic at all (from
	// context).
    if ((topicsEntered.length == 1 || topics.length == 1) && tags) {
        var allTopicTags = API.getTopicTags(filter);

        if (allTopicTags) {
            var topicTags = tags.filter(function(tag) {
                return allTopicTags.indexOf(tag) >= 0;
            });
            if (topicTags.length > 0) {
                if (topicsEntered.length == 1) {
                    topicsEntered[0].tags = topicTags;
                } else {
                    topics[0].tags = topicTags;
                }
            }
        }
    }

    if (topics.length > 0) {
        status.topics = topics;
    }

    if (options.parent) {
        attachReply(status, options.parent);
    }

    if (nums.length)
        status.nums = nums;

    if (links.length)
        status.links = links;

    runExtention(filter, 'createStatus', [status]);

    var tagsDesc = API.tags.desc(filter);
    var isChangeStatusMessage = false;
    // Detect if single message tag is status tag (tag must be in group with
	// id="lalala-status").
    if (!options.changeStatusNotification && tags && tags.length == 1) {
        var aTag = tags[0];
        if (aTag in tagsDesc && tagsDesc[aTag].group && tagsDesc[aTag].group.indexOf("status") > -1)
            isChangeStatusMessage = true;
    }

    // TODO: this is very bad, if no status.tags, why change meta to parent?
    // Try attach reply if no parent specified and intId specified.
    if (!status.parent && nums.length == 1) {
        DB.view("core/doc-by-custom-id", {
            key: ["intId", DB.type, DB.name, nums[0]],
            include_docs: true,
            success: function(data) {
                if (data.rows.length > 0) {
                    var doc = data.rows[0].doc;
                    attachReply(status, doc);
                    if (isChangeStatusMessage) {
                        changeAnotherDocMeta(doc);
                        return;
                    }
                }
                prepareMeta();
            },
            error: function(status, error, reason) {
                prepareMeta();
            }
        });

    } else if (status.parent && isChangeStatusMessage) {
        status.subtype = status.subtype || "changes";
        // Change parent meta only if this is change status message.
        DB.openDoc(status.parent._id, {
            success: function(doc) {
                changeAnotherDocMeta(doc);
            },
            error: function(status, error, reason) {
                prepareMeta();
            }

        });
    } else {
        prepareMeta();
    }

    function prepareMeta() {
        if (!options.changeStatusNotification) {
            API.tags.process(status, status.tags, tags);
        } else {
            status.tags = tags;
        }

        var requireIntId = status.requireIntId;
        delete status.requireIntId;

        if (options.fastCreateCallback) {
            options.fastCreateCallback(status);
        }

        if (requireIntId && !status.intId) {
            API.getFreeIntId && API.getFreeIntId(DB, status, callback);
        } else {
            callback(status);
        }
    }

    function changeAnotherDocMeta(doc) {
        if (options.fastCreateCallback) {
            options.fastCreateCallback(status);
        }

        doc.changeMetaByReferral = true;
        API.tags.process(doc, doc.tags, tags);
        delete doc["changeMetaByReferral"];

        status.tags = tags;

        API.storeStatus(DB, doc, {
            success: function() {
                // TODO: Store status notification?
                callback(status);
            },
            error: function() {
                callback(status);
            },
            withoutNotify: true
        });
    }
}

function storeAttachmentAndUpdateRelated(DB, attachment, options) {
    // TODO: _hooks here makes error "Bad special document member: _hooks"
    delete attachment._hooks;
    DB.saveDoc(attachment, {
        success: function(data) {
            DB.openDoc(attachment.refDoc._id, {
                success: function(doc) {
                    options.afterLoad && options.afterLoad(doc);

                    // Replace attachment.
                    for(var i = 0; i < doc.attachments.length; i++) {
                        if (doc.attachments[i]._id == attachment._id) {
                            doc.attachments[i] = attachment;
                        }
                    }

                    storeStatusAndUpdateNotifications(DB, doc, {
                        success: function() {
                            options && options.success && options.success();
                        },
                        error: function(status, error, reason) {
                            options && options.success && options.error(status, error, reason);
                        }
                    });
                },
                error: function(status, error, reason) {
                    options && options.success && options.error(status, error, reason);
                }
            });
        },
        error: function(status, error, reason) {
            options && options.success && options.error(status, error, reason);
        }
    });
}

function storeEmbedAndUpdateRelated(DB, embed, options) {
    // TODO: _hooks here makes error "Bad special document member: _hooks"
    delete embed._hooks;
    DB.saveDoc(embed, {
        success: function(data) {
            DB.openDoc(embed.refDoc._id, {
                success: function(doc) {
                    options.afterLoad && options.afterLoad(doc);

                    // Replace embed.
                    for(var i = 0; i < doc.embedded.length; i++) {
                        if (doc.embedded[i]._id == embed._id) {
                            doc.embedded[i] = embed;
                        }
                    }

                    storeStatusAndUpdateNotifications(DB, doc, {
                        success: function() {
                            options && options.success && options.success();
                        },
                        error: function(status, error, reason) {
                            options && options.success && options.error(status, error, reason);
                        }
                    });
                },
                error: function(status, error, reason) {
                    options && options.success && options.error(status, error, reason);
                }
            });
        },
        error: function(status, error, reason) {
            options && options.success && options.error(status, error, reason);
        }
    });
}

function storeStatusAndUpdateNotifications(DB, status, options) {
    API.storeStatus(DB, status, {
        success: function() {
            options && options.success && options.success();

        },
        error: function(status, error, reason) {
            options && options.success && options.error(status, error, reason);
        }
    });
}

function getTopic(filter, topicId, callback) {
    API.filterTopics(getFilter(), function(_error, topics) {
        if (topicId in topics) {
            callback(topics[topicId]);

        } else {
            var db = API.filterDB(filter);
            db.openDoc(topicId, {
                success: function(topic) {
                    topics[topicId] = topic;
                    callback(topic);
                }
            });
        }
    });
}

function isActiveSpace(s) {
    return s && s._active;
}

function textCrop(element) {
    // var startime = +new Date;

    if (!element)
        element = $(document.body);
    $pageHeader = $('.block-crop:visible', element);
    $pageHeader.each(function(){
        var width = $(this).width() - $(this).find('.block-crop-tools').width() - 30;
        if (width < 180) {
            width = 180;
        }
        $(this).find('.block-crop-text').width(width);
    });

    // var measured_time = +new Date - startime;

    // $.log('textCrop cost:', measured_time, 'ms', $pageHeader.length,
	// "objects");
}

MONTHS3 = {
    0: "Jan",
    1: "Feb",
    2: "Mar",
    3: "Apr",
    4: "May",
    5: "Jun",
    6: "Jul",
    7: "Aug",
    8: "Sep",
    9: "Oct",
    10: "Nov",
    11: "Dec"
};

// Doc widgets management.
var DOC_WIDGETS = {};

function prepareDocWidgets() {
    forEachApp(function(app, appName) {
        for (var widgetName in app.ddoc.evently) {
            var widget = app.ddoc.evently[widgetName];
            if (widget.docWidget && widget.docWidget.type) {
                // TODO: what if two concurent widgets with same doc type?
                DOC_WIDGETS[widget.docWidget.type] = {
                    name: widgetName,
                    app: app,
                    appName: appName
                };
            }
        }
    });
}

function createDocWidget($selector, doc, options) {
    if (!doc.type)
        return null;

    var widget = DOC_WIDGETS[doc.type] || DOC_WIDGETS["status"];

    // Display all docs as status.
    // TODO: force status files validation?
    if (!API.isAppEnable(widget.appName, API.filterPrepare({parent: doc}))) {
        widget = DOC_WIDGETS["status"];
    }
    return $selector.evently(widget.name, widget.app, [doc, options]);
}
// End doc widgets management.

function getMenuItem(filter, id, scope) {
    return API.getMenu(filter).filter(function(item) {
        var itemScope = item.scope || "self";
        return item.id == id && (!scope || scope == itemScope);
    })[0];
}

function getTopicTagsMenu(topic, filter) {
    filter = API.filterPrepare(filter || {topic: topic});

    var links = [{
        id: "flow",
        title: "Activity",
        url: getUrlByFilter($.extend({}, filter, {view: "flow", tag: ""})),
        selected: filter.view == "flow",
        tag: "flow"
    }];

    API.getMenu(filter).forEach(function(appMenu) {
        if (appMenu.topicTag) {
            links.push({
                id: appMenu.id,
                title: appMenu.topicTag.entitiesTitle || appMenu.topicTag.title || appMenu.title(),
                url: getUrlByFilter($.extend({}, filter, {view: appMenu.id, tag: ""})),
                hide: !appMenu.topicTag.tag || !topic.tags || $.inArray(appMenu.topicTag.tag, topic.tags) == -1,
                selected: appMenu.id == filter.view,
                tag: appMenu.topicTag.tag
            });
        }
    });

    return links;
}

function getTopicTagDesc(filter, tag) {
    var appMenu = API.getMenu(filter).filter(function(appMenu) {
        return appMenu.topicTag && appMenu.topicTag == tag;
    })[0];

    return appMenu? {
        id: appMenu.id,
        title: appMenu.topicTag.entitiesTitle || appMenu.topicTag.title || appMenu.title(),
        url: getUrlByFilter($.extend({}, filter, {view: appMenu.id, tag: ""})),
        tag: appMenu.topicTag.tag
    }: null
}
// End apps menu settings.

function diffStatusBody(body1, body2) {
    var textFilter = function(token) {return token.t != 'text' && token.t != 'link'};

    var tokens1 = lexStatusBody(body1).filter(textFilter);
    var tokens2 = lexStatusBody(body2).filter(textFilter);

    var map = {tag: {}, person: {}, topic: {}, cp: {}};

    tokens1.forEach(function(token) {
        var typeMap = map[token.t];
        if (typeMap && !(token.v in typeMap)) typeMap[token.v] = "r";
    });

    tokens2.forEach(function(token) {
        var typeMap = map[token.t];

        // TODO: temporary hardcode bugfix.
        if (!typeMap)
            return;

        if (token.v in typeMap) {
            delete typeMap[token.v];

        } else {
            typeMap[token.v] = "a";
        }
    });

    return map;
}

function applyMetaDiff(doc, diff) {
    var tagsDesc = API.tags.desc(API.filterPrepare({parent: doc}));

    for (var type in diff) {
        var typeDiff = diff[type];
        var value;
        var p;
        switch (type) {
            case "tag": {
                if (!doc.tags) doc.tags = [];
                for (value in typeDiff) {
                    var tag = value.substr(1);
                    p = $.inArray(tag, doc.tags);
                    if (typeDiff[value] == "r") {
                        if (p >= 0) {
                            doc.tags = API.tags.remove(tag, doc.tags, tagsDesc, function(tag, remove) {
                                API.tags.handle(tag, doc, remove? "remove": "add", tagsDesc);
                            });

                        } else $.log("warn", "tag not found", value);

                    } else {
                        if (p == -1) {
                            doc.tags = API.tags.add(tag, doc.tags, tagsDesc, function(tag, remove) {
                                API.tags.handle(tag, doc, remove? "remove": "add", tagsDesc);
                            });

                        } else $.log("warn", "tag already exists", value);
                    }
                }
                break;
            }

            case "person": {
                if (!doc.owners) doc.owners = [];
                for (value in typeDiff) {
                    var nickname = value.substr(1);
                    var owner = API.profile(nickname) || {id: nickname, nickname: nickname};
                    p = -1;
                    doc.owners.forEach(function(o, i) {
                        if (o.id == owner.id) p = i;
                    });

                    if (typeDiff[value] == "r") {
                        if (doc.owner && doc.owner.id == owner.id) {
                            delete doc.owner;
                        }
                        if (p >= 0) doc.owners.splice(p, 1);
                        else $.log("warn", "owner not found", value);

                    } else {
                        if (p == -1) doc.owners.push(owner);
                        else $.log("warn", "owner already exists", value);
                    }
                }
                break;
            }

            case "topic": {
                if (!doc.topics) doc.topics = [];
                for (value in typeDiff) {
                    var title = value.substr(1, value.length - 2);
                    p = -1;
                    doc.topics.forEach(function(t, i) {
                        if ((t.title || '').toLowerCase() == title.toLowerCase()) p = i;
                    });

                    if (typeDiff[value] == "r") {
                        if (doc.topic && doc.title.toLowerCase() == title.toLowerCase()) {
                            delete doc.topic;
                        }
                        if (p >= 0) doc.topics.splice(p, 1);
                        else $.log("warn", "topic not found", value);

                    } else {
                        if (p == -1) doc.topics.push({title: title});
                        else $.log("warn", "topic already exists", value);
                    }
                }
                break;
            }

            case "cp": {
                for (value in typeDiff) {
                    var cp = parseInt(value.substr(1, value.length - 3));
                    if (typeDiff[value] == "r") {
                        if (doc.cp && doc.cp == cp) {
                            delete doc.cp;
                        }

                    } else {
                        doc.cp = cp;
                    }
                }
            }
        }
    }
}

(function() { // Team.FM API

API = typeof API === 'undefined'? {}: API;

API.addStatusHook = function(status, type, func) {
    if (!status._hooks) status._hooks = {};
    if (!status._hooks[type]) status._hooks[type] = [];
    status._hooks[type].push(func);
};

API.topics = API.topics || {};

API.topics.inTopic = function(doc, topicId) {
    if (doc.topic && doc.topic._id == topicId)
        return true;

    if (doc.topics) {
        for (var i = 0; i < doc.topics.length; i++)
            if (doc.topics[i]._id == topicId)
                return true;
    }

    return false;
};

// ONLINE - OFFLINE api
API.online = true;
API.offlineQueue = [];

API.notifications = API.notifications || {};
API.notifications.blockErrors = function() {
    API.notifications.blockErrors.blocked++;
};
API.notifications.unblockErrors = function() {
    API.notifications.blockErrors.blocked =
    Math.max(0, API.notifications.blockErrors.blocked - 1);
};
API.notifications.blockErrors.blocked = 0;

API.notifications.error = function(msg, resp, req) {
    if (req && req.textStatus == 'parseerror' && req.status == 200) return;

    var error = {
        message: msg,
        reason: resp && resp.reason,
        error: resp && resp.error,
        resp: resp
    };

    API.log(msg);

    setTimeout(function() {
        if (API.notifications.blockErrors.blocked) return;

        $(window).trigger('couchapp-error', [error]);
    }, 150);

    if (req && req.status == 403) {
        // Refresh page if was logout
        document.location.reload(true);
    }
};
API.notifications.error.helpMessage =
    "Please wait few minutes and refresh page";

API.prepare = {};
API.partials = {};

// User Storage
API.userStorage = API.userStorage || {};

API.userStorage.initQueue = [];
API.userStorage.initialized = false;

API.userStorage.init = function(callback) {
    callback = callback || function() {};

    var DB = API.userStorage.db = API.userDB(),
    us = API.userStorage.object = {},
    usRev = API.userStorage.objectRev = {};

    DB.view('core/user-storage', {
        success: onload,
        error: function() {
            callback('failed to load user storage object');
        }
    });

    function onload(data) {
        if (!data || !data.rows) {
            callback('server error');
            return;
        }

        data.rows.forEach(function(row) {
            us[row.key] = row.value.value;
            usRev[row.key] = row.value.rev;
            $$().set(row.key, row.value.value, true);
        });

        API.unregisterChangesListener('user-storage');
        API.registerChangesListener(DB, function(docs) {
            docs.forEach(function(doc) {
                if (doc.type !== 'user-storage-property') return;

                if (doc._deleted) {
                    $$().del(doc.key, true);
                    us[doc.key] = undefined;
                    usRev[doc.key] = undefined;
                } else {
                    us[doc.key] = doc.value;
                    usRev[doc.key] = doc._rev;
                    $$().set(doc.key, doc.value, true);
                }
            });
        }, 'user-storage');

        API.userStorage.initialized = true;
        API.userStorage.initQueue.forEach(function(fn) {
            fn();
        });

        callback(null, us);
    }
};

API.userStorage.set = function(key, value, callback) {
    if (!API.userStorage.initialized) {
        API.userStorage.initQueue.push(function() {
            API.userStorage.set(key, value, callback);
        });
        return;
    }
    callback || (callback = function() {});

    var DB = API.userStorage.db;

    API.md5(key, function(err, mdt) {
        if (err) {
            callback(err);
            return;
        }
        var _id = 'usp-' + mdt;

        DB.saveDoc({
            _id: _id,
            _rev: API.userStorage.objectRev[key],
            type: 'user-storage-property',

            db: {
                name: API.username(),
                type: 'person'
            },

            key: key,
            value: value,

            version: 1
        }, {
            success: function() {
                callback(null, {
                    key: key,
                    value: value
                });
            },
            error: function() {
                callback('failed to set property value');
            }
        });
    });
};

API.userStorage.unset = function(key, callback) {
    if (!API.userStorage.initialized) {
        API.userStorage.initQueue.push(function() {
            API.userStorage.unset(key, callback);
        });
        return;
    }
    callback || (callback = function() {});

    var DB = API.userStorage.db;
    API.md5(key, function(err, md5) {
        if (err) {
            callback(err);
            return;
        }

        DB.removeDoc({
            _id: 'usp-' + md5,
            _rev: API.userStorage.objectRev[key]
        }, {
            success: function() {
                callback(null);
            },
            error: function() {
                callback(null);
            }
        });
    });
};

API.userStorage.get = function(key) {
  return API.userStorage.object[key];
};

// Attachments

API.prepare.attachments = function(doc, options) {
    var space = API.filterSpace({parent: doc});
    var files = API.prepare.attachments.getAll(doc),
        hasFiles = files.length > 0,
        images = API.prepare.attachments.extractByType(files, 'img'),
        hasImages = images.length > 0;

    if (space && space._allowPublish) {
        images = images.map(function(attachment) {
            var result = $.extend(true, {}, attachment);
            result.published = attachment.tags && attachment.tags.indexOf("public") > -1;
            result.showPublish = result.published || space._admin;
            return result;
        });
    }
    
    var MAX_IMAGES = options && options.limit || null;
    var docUrl = '';
    var moreImages = MAX_IMAGES && images.length > MAX_IMAGES;
    if (moreImages)
        docUrl = getUrlByFilter({parent: doc});

    return {
        files: files,
        hasSomething: hasFiles || hasImages,
        hasFiles: hasFiles,
        images: images,
        limitedImages: MAX_IMAGES ? images.slice(0, MAX_IMAGES) : images,
        hasImages: hasImages,
        manyImages: images.length > 1,
        moreImages: moreImages,
        moreImagesCount: images.length - MAX_IMAGES,
        moreImagesIsOne: images.length - MAX_IMAGES == 1,
        imagesUrl: API.prepare.attachments.imagesUrl(doc),
        docUrl: docUrl
    };
};

API.prepare.truncHtmlToText = function(html, max_length) {
    if (!html)
        return null;
    var text = html.replace(/<[^>]*>/g, "");
    if (text && text.length > max_length) {
        return text.substr(0, max_length) + "...";
    }
    return text;
}

API.prepare.embedded = function(doc) {
    var items = [];
    var docUrl = getUrlByFilter({parent: doc});
    var aDoc = doc;

    var space = API.filterSpace({parent: doc});

    if (doc.embedded) {
        doc.embedded.forEach(function(doc) {
            API.cacheDoc(doc);

            var image_url = null;
            var compact = true;
            var html = "";
            var is_image = false;
            var is_video = false;
            
            if (doc.preview.images) {
                var images = doc.preview.images.filter(function(im) {
                    return im.width >= 90 && im.height >= 90;
                });
                if (images.length > 0) {
                    var im = images[0];
                    image_url = im.url;
                    
                    var realWidth = im.width;
                    var MAX_HEIGHT = 300;
                    if (im.height > MAX_HEIGHT) {
                        realWidth = MAX_HEIGHT * realWidth / im.height;
                    }
                    if (realWidth > 360) {
                        compact = false;
                    }
                }
            }
            
            // Check if its single image.
            if (doc.preview.object && doc.preview.object.type == "photo") {
                image_url = doc.preview.object.url;
                is_image = true;
            } else
            // Check if its video.
            if (doc.preview.object && doc.preview.object.type == "video") {
                // Image gotten from "images".
                is_video = true;
                html = doc.preview.object.html;
            }
            
            var published = doc.tags && doc.tags.indexOf("public") > -1;
            items.push({
                id: doc._id,
                refDocId: aDoc._id,
                favicon_url: API.faviconUrl(doc.preview.favicon_url || doc.preview.original_url),
                provider_name: doc.preview.provider_name,
                pageUrl: doc.preview.url,
                docUrl: docUrl,
                title: doc.preview.title,
                description: !is_image ? API.prepare.truncHtmlToText(doc.preview.description, 600) : null,
                image_url: image_url,
                trumb_url: image_url && API.trumbUrl(image_url) || '',
                attachmentClass: compact ? "compact" : "",
                is_image: is_image,
                is_video: is_video,
                published: published,
                html: html,
                showPublish: space && space._allowPublish && (published || space._admin || space._virtual_admin)
            });
        });
    }
    return {
        items: items,
        has_items: items.length > 0
    };
};

API.prepare.embedded_details = function(doc) {
    var embeds = [];
    var articles = [];

    if (doc.embedded) {
        doc.embedded.forEach(function(doc) {
            var image_url = null;
            if (doc.preview.images) {
                var images = doc.preview.images.filter(function(im) {
                    return im.width >= 90 && im.height >= 90;
                });
                if (images.length > 0) {
                    image_url = images[0].url;
                }
            }
            var context = {
                favicon_url: API.faviconUrl(doc.preview.favicon_url || doc.preview.original_url),
                provider_name: doc.preview.provider_name,
                pageUrl: doc.preview.url,
                title: doc.preview.title,
                content: doc.preview.content || doc.preview.description || '',
                image_url: image_url,
                preview_html: (doc.preview.object && doc.preview.object.html) || null
            };
            // Remove all content images.
            context.content = context.content.replace(/<img[^>]*>/gi, '');
            
            if (context.preview_html)
                embeds.push(context)
            else
                articles.push(context);
        });
    }
    return {
        embeds: embeds,
        articles: articles,
        has_articles: articles.length > 0,
        has_items: embeds.length > 0 || articles.length > 0
    };
};

API.prepare.attachments.getAll = function(doc) {
    var attachments = [];
    var fileTypes = {
      'image/vnd.adobe.photoshop': 'psd',
      'application/msword': 'doc',
      'application/pdf': 'pdf',
      'application/vnd.ms-excel': 'xsl',
      'application/vnd.oasis.opendocument.text': 'doc',
      'application/zip': 'zip',
      'text/html': 'htm'
    };

    var attachmentDocs = doc.attachments;
    if (attachmentDocs) {
        for (var i = 0, len = attachmentDocs.length; i < len; i++) {
            var adoc = attachmentDocs[i];
            API.cacheDoc(adoc);
            // Local data corruption bugfix.
            if (adoc) {
                // TODO big generic code, remove it from here.
                var filetype = '';

                if (!adoc.fileType) {
                    filetype = '';

                } else if (adoc.fileType.match("image")) {
                    filetype = 'img';

                } else {
                    filetype = fileTypes[adoc.fileType] || '';
                }

                if (!filetype) {
                    filetype = (adoc.name.split(".").pop() || '').toLowerCase();
                }

                // TODO make common func for db uri.
                var _l = location;
                var uri = _l.protocol + '//' + _l.host;
                if (adoc.tags && adoc.tags.indexOf("public") > -1) {
                    if (adoc.db.type == "project") {
                        uri += '/photo-of-the-day/' + getPrefixMatchByDBType(adoc.db.type) + adoc.db.name + "/attachments/" + adoc._id + "/" + adoc.name;
                    } else {
                        uri += '/' + getPrefixMatchByDBType(adoc.db.type) + adoc.db.name + "/attachments/" + adoc._id + "/" + adoc.name;
                    }
                } else {
                    uri += API.filterDB({parent: adoc}).uri + adoc._id + "/" + adoc.name;
                }

                var attachment = {
                    id: adoc._id,
                    refDocId: doc._id,
                    name: adoc.name,
                    description: adoc.description,
                    type: filetype.toLowerCase(),
                    uri: uri,
                    trumb_uri: API.trumbUrl(uri, 't170'),
                    tags: adoc.tags,
                    doc: adoc
                };
                attachments.push(attachment);
            }
        }
    }
    return attachments;
};

API.prepare.attachments.extractByType = function(attachments, type) {
    var grouped = [];

    for (var i = 0, len = attachments.length; i < len; i++) {
        var attachment = attachments[i];
        if (attachment.type !== type) continue;

        grouped.push(attachment);

        attachments.splice(i, 1);

        i--;len--;
    }

    return grouped;
};

API.prepare.attachments.imagesUrl = function(status) {
    if (!status || !status.db) return '#';

    return API.filterDB({parent: status}).uri + '_design/core/_show/attachments/' + status._id;
};

// Title
API.trimDocBody = function(doc) {
    var body = (doc.body || '').toString(),
    trimmed = body.match(/^(.{1,70})(?:$|\s)/m);

    if (trimmed) {
        trimmed = trimmed[1];
        trimmed = trimmed.length == body.length ? trimmed :
        trimmed + ' ...';
    } else {
        trimmed = body.substr(0, 70) + ' ...';
    }

    return trimmed;
};

API.setTitle.original = document.title;

var _STORAGE = {};
API.filterStorage = function(filter) {
    var id = API.filterId(filter);
    if (id in _STORAGE)
        return _STORAGE[id];

    else
        return _STORAGE[id] = {};
};

// For now this is used for inline doc editor.
API.cachedDocs = {};
API.cacheDoc = function(doc) {
    API.cachedDocs[doc._id] = doc;
    if (doc.intId) {

        API.cachedDocs[API.filterId(API.filterPrepare({parent: doc})) + "-" + doc.intId] = doc;
    }
};

API.parseDate = function(date) {
    if (typeof date == "string") {
        try {
            return new Date(date);

        } catch (e) {
            return null;
        }
    }
    return date;
};

API.formatShortDate = function(date) {
    if (!date)
        return "";

    date = API.parseDate(date);
    if (isNaN(date.getDate()))
        return "";

    var now = new Date();
    if (now.getFullYear() == date.getFullYear() && now.getMonth() == date.getMonth() && now.getDate() == date.getDate()) {
        return date.format("H:i");
    } else {
        return date.format("j M");
    }
};

API.tags = {};
API.tags.is = function(tag, tag2, tagsDesc) {
    return tag in tagsDesc && tagsDesc[tag]._is.indexOf(tag2) >= 0;
};

API.tags.groups = function(filter) {
    var groups = API.filterStorage(filter).tagGroups;

    if (!groups) {
        groups = API.filterStorage(filter).tagGroups = {};
        var tagsDesc = this.desc(filter);
        for (var tag in tagsDesc) {
            var group = tagsDesc[tag].group;
            if (group) {
                if (groups[group]) groups[group].push(tag);
                else groups[group] = [tag];
            }
        }
    }

    return groups;
};

API.tags.byGroup = function(filter, group) {
    var tags = [];
    var tagsDesc = this.desc(filter);
    for (var tag in tagsDesc) {
        if (tagsDesc[tag].group === group) {
            tags.push(tag);
        }
    }
    return tags;
};

API.tags.byDocGroup = function(doc, group) {
    if (!doc.tags) return null;

    var tag = null;
    var tagsDesc = this.desc(API.filterPrepare({parent: doc}));
    doc.tags.forEach(function(t) {
        if (t in tagsDesc && tagsDesc[t].group === group) {
            tag = t;
        }
    });

    return tag;
};

API.tags.process = function(doc, oldTags, newTags) {
    oldTags = oldTags || [];

    var desc = this.desc(API.filterPrepare({parent: doc}));
    newTags.forEach(function(tag) {
        oldTags = API.tags.add(tag, oldTags, desc, function(tag, remove) {
            API.tags.handle(tag, doc, remove? "remove": "add", desc);
        });
    });

    doc.tags = oldTags;
};

var API_tags_loadSpaceTagsDesc = function(filter) {
    function prepareTagsDesc(tagsDesc) {
        function prepareTagDesc(tagDesc) {
            if (!tagDesc || tagDesc._is) return;

            if (tagDesc.badge)
                tagDesc._badge = true;

            if (tagDesc.is) {
                tagDesc._is = [tagDesc.is];
                if (tagDesc.is in tagsDesc) {
                    var parentTagDesc = tagsDesc[tagDesc.is];
                    prepareTagDesc(parentTagDesc);
                    tagDesc._is = tagDesc._is.concat(parentTagDesc._is);
                    if (parentTagDesc._badge)
                        tagDesc._badge = true;

                    if (parentTagDesc['flow-view-priority']) {
                        tagDesc['flow-view-priority'] = parentTagDesc['flow-view-priority'];
                    }
                }

            } else {
                tagDesc._is = [];
            }

            if (tagDesc.use) {
                if (typeof tagDesc.use == 'string')
                    tagDesc._use = [tagDesc.use];
                else
                    tagDesc._use = tagDesc.use;

            } else {
                tagDesc._use = [];
            }
        }

        for (var tag in tagsDesc) {
            var tagDesc = tagsDesc[tag];
            prepareTagDesc(tagDesc);
        }
    }

    var enTrue = function() {return true;}
    var enFalse = function() {return false;}
    var enCriteria = function(criteria, space) {
        if (criteria.types && $.inArray(space.type, criteria.types) >= 0)
            return true;

        return false;
    }

    var tagsDesc = {};

    API.forEachApp(filter, function(app) {
        var appTagsDesc = app.ddoc.tags;
        if (appTagsDesc) {
            for (var tag in appTagsDesc) {
                var tagDesc = appTagsDesc[tag];

                switch (typeof tagDesc.enabled) {
                    case "undefined":
                        tagDesc._enabled = enTrue;
                        break;

                    case "object":
                        if (!tagDesc.enabled) tagDesc._enabled = enFalse;
                        else
                            (function(criteria) {
                                tagDesc._enabled = function(space) {
                                    return enCriteria(criteria, space);
                                }
                            })(tagDesc.enabled);
                        break;

                    case "string":
                        if (tagDesc.enabled.match(/^function/)) {
                            tagDesc._enabled = eval("var __f = " + tagDesc.enabled + ";\n__f")
                            break;
                        }

                     default:
                         tagDesc._enabled = tagDesc.enabled? enTrue: enFalse;
                }

                if (tagDesc.handler) {
                    if (typeof tagDesc.handler == "string")
                        tagDesc.handler = eval("var __f = " + tagDesc.handler + ";\n__f");
                }

                if (tagDesc.filter) {
                    if (typeof tagDesc.filter == "string")
                        tagDesc.filter = eval("var __f = " + tagDesc.filter + ";\n__f");
                }

                if (tagDesc['flow-view-priority'])
                    tagDesc['flow-view-priority'] = parseInt(tagDesc['flow-view-priority']);

                if (tagDesc._enabled(filter.db)) {
                    if (!(tag in tagsDesc)) tagsDesc[tag] = {};
                    $.extend(true, tagsDesc[tag], tagDesc);
                }
            }
        }
    });

    prepareTagsDesc(tagsDesc);

    return tagsDesc;
};

API.tags.desc = function(filter) {
    var tagsDesc = API.filterStorage(filter).tagsDesc;

    if (!tagsDesc)
        tagsDesc = API.filterStorage(filter).tagsDesc = API_tags_loadSpaceTagsDesc(filter);

    return tagsDesc;
};

API.tags.compact = function(tags, tagsDesc) {
    if (!tags) return [];

    var hideTags = {};
    tags.forEach(function(tag) {
        if (!(tag in hideTags) && tag in tagsDesc) {
            tagsDesc[tag]._is.forEach(function(tag) {
                hideTags[tag] = true;
            });
        }
    });

    return tags.filter(function(tag) {return !(tag in hideTags);});
};

API.tags.expand = function(tags, tagsDesc) {
    var expandedTags = [];
    tags.forEach(function(tag) {
        if ($.inArray(tag, expandedTags) == -1) {
            expandedTags.push(tag);
            if (tag in tagsDesc) {
                tagsDesc[tag]._is.forEach(function(tag) {
                    if ($.inArray(tag, expandedTags) == -1) {
                        expandedTags.push(tag);
                    }
                });
            }
        }
    });

    return expandedTags;
};

API.tags.removeShortcut = function(doc, tag) {
    var tagsDesc = API.tags.desc(API.filterPrepare({parent: doc}));
    doc.tags = API.tags.remove(tag, doc.tags, tagsDesc, function(tag, remove) {
        API.tags.handle(tag, doc, remove? "remove": "add", tagsDesc);
    });
}

API.tags.remove = function(tag, tags, tagsDesc, callback) {
    if (!tags)
        return tags;

    var result = [];
    tags.forEach(function(t) {
        if (t == tag || API.tags.is(t, tag, tagsDesc)) {
            callback && callback(t, true);

        } else {
            result.push(t);
        }
    });

    return result;
};

API.tags.add = function(tag, tags, tagsDesc, callback) {
    tags = tags || [];

    if (tags.indexOf(tag) >= 0)
        return tags;

    var tagGroups = {};
    var deleteTags = [];
    tags.forEach(function(tag) {
         if (tag in tagsDesc && tagsDesc[tag].group) {
            var group = tagsDesc[tag].group;
            if (group in tagGroups) {
                deleteTags.push(tag);
            } else {
                tagGroups[group] = tag;
            }
        }
    });

    // Delete tags if they make group conflicts.
    deleteTags.forEach(function(tag) {
        tags = API.tags.remove(tag, tags, tagsDesc, function(tag) {
            callback && callback(tag, true);
        });
    });

    //$.log("all tagsDesc", tagsDesc);
    //$.log("existing tagGroups", tagGroups);

    function addRequiredTag(tag) {
        if ($.inArray(tag, tags) == -1) {
            var tagGroup = tag in tagsDesc && tagsDesc[tag].group;
            if (tagGroup && tagGroup in tagGroups) {
                var oldTag = tagGroups[tagGroup];
                //$.log("removeGrupTag", oldTag, tags);
                tags = API.tags.remove(oldTag, tags, tagsDesc, function(tag) {
                    if (tag in tagsDesc && tagsDesc[tag].group)
                        delete tagGroups[tagsDesc[tag].group];

                    callback && callback(tag, true);
                });
            }
            if (tagGroup)
                tagGroups[tagGroup] = tag;

            //$.log("addRequiredTag", tag, tags);

            tags.push(tag);
            callback && callback(tag);

            if (tag in tagsDesc) {
                tagsDesc[tag]._is.forEach(addRequiredTag);
                tagsDesc[tag]._use.forEach(addOptionalTag);
            }
        }
    }

    function addOptionalTag(tag) {
        if ($.inArray(tag, tags) == -1) {
            var tagGroup = tag in tagsDesc && tagsDesc[tag].group;
            //$.log("check optional tag", tag, tagGroup, tagGroups);
            if (!(tagGroup && tagGroup in tagGroups)) {
                //$.log("addOptionalTag", tag);
                addRequiredTag(tag);
            }
        }
    }

    addRequiredTag(tag);
    return tags;
};

API.tags.extractBadges = function(tags, tagsDesc) {
    var result = [];
    for (var i = 0; i < tags.length; i++) {
        if (tags[i] in tagsDesc && tagsDesc[tags[i]]._badge)
            result.push(tags[i]);
    }

    return result;
};

API.tags.handle = function(tag, doc, op, tagsDesc) {
    tagsDesc = tagsDesc || this.desc(API.filterPrepare({parent: doc}));

    if (tag in tagsDesc && tagsDesc[tag].handler) {
        var tagHandler = tagsDesc[tag].handler;
        if (tagHandler) {
// try {
                var res = tagHandler(doc, op);
                if (typeof res == 'function') {
                    API.addStatusHook(doc, 'post-store', res);
                }
// } catch(e) {
// $.log("error in tag handler", tag, e, e.stack);
// throw e;
// }
        }
    }
};

API.tags.handleTags = function(tags, doc, op) {
    if (!tags) return;

    var tagsDesc = this.desc(API.filterPrepare({parent: doc}));

    tags.forEach(function(tag) {
        this.handle(tag, doc, op, tagsDesc);
    }, this);
}

API.tags.filter = function(filter, tag) {
    var tagsDesc = this.desc(filter);
    return (tag in tagsDesc && tagsDesc[tag].filter)? tagsDesc[tag].filter: null;
};

// md5 support
API.md5 = function(data, callback) {
    API.md5.queue.push(callback || function() {});
    API.md5.worker.postMessage(data);
};
API.md5.worker = new Worker('js/md5worker.js');
API.md5.queue = [];
API.md5.worker.addEventListener('message', function(e) {
    try {
        API.md5.queue.shift()(null, e.data);
    } catch (e) {
    }
}, false);
API.md5.worker.addEventListener('error', function(e) {
    try {
        API.md5.queue.shift()(e);
    } catch (e) {
    }
}, false);

// gravatar

API.follows = API.follows || {};

API.follows.asArray = function(callback) {
    var result = [],
    followManager = $$('#id_follow_manager');

    followManager.get(function(err, followManager) {
        var follows = followManager.follows;

        for (var i in follows) {
            result.push(i);
        }

        result.sort(function(a, b) {
            return a.created_at < b.created_at ? -1 :
            a.created_at == b.created_at ? 0 : 1;
        });

        callback && callback(null, result);
    });

    return result;
};


API.filterState = {};



API.flow = {};

var flowSources = {};
var flowLoadSources = function(filter) {
    var list = [];
    API.forEachApp(filter, function(app, appName) {
        var sources = app.ddoc['flow-sources'];
        if (sources) {
            for (var sourceId in sources) {
                var source = sources[sourceId];
                source.id = appName + '/' + sourceId;
                if (typeof source.data == "string") {
                    source.data = eval("var __f = " + source.data + ";\n__f")
                }
                if (typeof source.probe == "string") {
                    source.probe = eval("var __f = " + source.probe + ";\n__f")
                }
                source.order = parseInt(source.order || "0");
                list.push(source);
            }
        }
    });

    list.sort(function(s1, s2) {
        var o1 = s1.order;
        var o2 = s2.order;

        return o1 < o2? -1: o1 == o2? 0: 1;
    });

    return list;
};

API.flow.lookupSource = function(filter) {
    var id = API.filterId(filter);
    var sources = flowSources[id] || (flowSources[id] = flowLoadSources(filter));

    for (var i = 0; i < sources.length; i++) {
        var s = sources[i];
        var key = s.probe(filter);
        if (key) {
            return {
                key: key,
                data: s.data
            };
        }
    }

    return undefined;
};

API.flow.getSource = function(filter, sourceId) {
    var id = API.filterId(filter);
    var sources = flowSources[id] || (flowSources[id] = flowLoadSources(filter));

    for (var i = 0; i < sources.length; i++) {
        var s = sources[i];
        if (s.id === sourceId) {
            return s;
        }
    }

    return undefined;
};

var flowViews = {};
var flowLoadViews = function(filter) {
    var views = {};
    API.forEachApp(filter, function(app) {
        var appFlowViews = app.ddoc['flow-views'];
        if (appFlowViews) {
            for (var viewId in appFlowViews) {
                var view = appFlowViews[viewId];
                if (typeof view.data == "string") {
                    view.data = eval("var __f = " + view.data + ";\n__f")
                }
                views[viewId] = view;
            }
        }
    });

    return views;
};

API.flow.lookupView = function(filter, viewId) {
var id = API.filterId(filter);
var views = flowViews[id] || (flowViews[id] = flowLoadViews(filter));
return views[viewId];
};


// End of Team.FM API\
})();

// highlight
function itemHighlight($item, callback) {
    $item.css('background-color','#fffcd8').animate({
        backgroundColor: '#ffffff'
    },1000, function(){
        $item.css('background-color','');
        if(typeof(callback) === 'function'){
            callback.call(this);
        }
    });
}


function getDocTopics(doc) {
    var topics = [];
    var docTopics = {};
    if (doc.topic) {
        docTopics[doc.topic._id] = true;
        topics.push(doc.topic);
    }
    if (doc.topics) {
        doc.topics.forEach(function(topic) {
            if (!(topic._id in docTopics)) {
                topics.push(topic);
                docTopics[topic._id] = true;
            }

        });
    }

    return topics;
}

function defaultAvatar(e) {
    e.target.src = 'images/default.png';
}

function arrayRemove(array, element) {
    if (!array)
        return [];

    var i = array.indexOf(element);
    if (i >= 0)
        return array.splice(i, 1);

    return array;
}

function parseQueryString(str) {
    var vars = [];
    var arr = str.split('&');
    var pair;
    for (var i = 0; i < arr.length; i++) {
        pair = arr[i].split('=');
        vars.push(pair[0]);
        vars[pair[0]] = unescape(pair[1]);
    }
    return vars;
}

function runIfFun2(fun, args, thiz) {
    // if the field is a function, call it, bound to the widget
    var f = Object.parse(fun);
    // $.log(me, fun, args);
    if (typeof f == "function") {
        if (DEBUG) {
            return f.apply(thiz || this, args);
                
        } else {
            try {
                return f.apply(thiz || this, args);
            } catch (e) {
                // IF YOU SEE AN ERROR HERE IT HAPPENED WHEN WE TRIED TO RUN YOUR
                // FUNCTION
                $.log({
                    "message" : "Error in function",
                    "error" : e,
                    "src" : fun
                });
                throw e;
            }
        }
    }
}
