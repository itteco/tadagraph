function(e) {
    var $$this = $$(this);

    // Dict "doc-id" - "follow info".
    var follows = {};
    $$this.follows = follows;
    
    // Dict "follow info - id" - "follow info".
    var followsDict = {};
    $$this.followsDict = followsDict;

    $$this.get = function(callback) {
      if ($$this.loaded) {
        callback(null, $$this);
      } else {
        $$this.get.queue.push(callback);
      }
    };
    $$this.get.queue = [];
    
    API.username(function(error, username) {
        var DB = API.userDB();
        DB.view("core/user-follows", {
            key: username,
            include_docs: true,
            success: function(data) {
                data.rows.forEach(function(row) {
                    var doc = row.doc;
                    follows[doc.ref._id] = doc;
                    followsDict[doc._id] = doc;
                });

                $("a[data-follow-id]").each(function(){
                    updateStarElement($(this));
                });

                $$this.loaded = true;
                $$this.get.queue.forEach(function(callback) {
                  callback(null, $$this);
                });
                $$this.get.queue = [];
            }
        });
        
        API.registerChangesListener(DB, function(docs) {
            docs.forEach(function(doc) {
                if (doc.type && doc.type == 'follow') {
                    follows[doc.ref._id] = doc;
                    followsDict[doc._id] = doc;
                    updateStarElement($('a[data-follow-id="' + doc.ref._id + '"]'));
                }
                if (doc._deleted && doc._id && followsDict[doc._id]) {
                    var f = followsDict[doc._id];
                    delete follows[f.ref._id];
                    delete followsDict[f._id];
                    updateStarElement($('a[data-follow-id="' + f.ref._id + '"]'));
                }
            });
        });

        $(document).bind('DOMNodeInserted', function(event) {
            if (event.target.nodeType === 1) {
                var $element = $(event.target);
                if ($element.attr('data-follow-id')) {
                    updateStarElement($element);
                    if ($element.is("a"))
                        bindStarEvent($element);
                }

                $("[data-follow-id]", $element).each(function() {
                    var $this = $(this);
                    updateStarElement($this);
                    if ($this.is("a"))
                        bindStarEvent($this);
                });
            }
        }).bind("toggle-starred", function(e, id) {
            toggleStarred(id);
        });

        function toggleStarred(id) {
            if (follows[id]) {
                DB.removeDoc(follows[id]);

            } else {
                DB.saveDoc({
                    type: "follow",
                    ver: 1,
                    db: {
                        name: DB.name,
                        type: DB.type
                    },
                    created_at: new Date(),
                    created_by: API.username(),
                    ref: {_id: id}
                });
            }
        }

        function updateStarElement($element) {
            if ($element.length == 0)
                return;
            var id = $element.attr('data-follow-id');

            // Here are defined different star styles.
            if ($element.hasClass("star")) {
                if (follows[id]) {
                    $element.addClass("starred").find("span.icons").addClass("starred");
                } else {
                    $element.removeClass("starred").find("span.icons").removeClass("starred");
                }

            } else if ($element.hasClass("item-star") || $element.hasClass("item-starred")) {
                if (follows[id]) {
                    $element.removeClass("item-star").addClass("item-starred");
                    $("span.icon", $element).removeClass("item-star").addClass("item-starred");
                } else {
                    $element.removeClass("item-starred").addClass("item-star");
                    $("span.icon", $element).removeClass("item-starred").addClass("item-star");
                }

            } else if ($element.hasClass("editor-star") || $element.hasClass("editor-unstar")) {
                if (follows[id]) {
                    $element.removeClass("editor-star").addClass("editor-unstar");
                    $("span.icon", $element).removeClass("editor-star").addClass("editor-unstar");
                    $element.parent().parent().addClass("unstar").parent().addClass("starred");
                } else {
                    $element.removeClass("editor-unstar").addClass("editor-star");
                    $("span.icon", $element).removeClass("editor-unstar").addClass("editor-star");
                    $element.parent().parent().removeClass("unstar").parent().removeClass("starred");
                }

            } else {
                if (follows[id]) {
                    $element.addClass("starred");

                } else {
                    $element.removeClass("starred");
                }
            }


            $("span.icon", $element).removeClass("loading");
        }

        function bindStarEvent($element) {
            if ($element.length == 0)
                return;

            if ($element.hasClass("data-follow-bound"))
                return;

            $element.click(function() {
                var id = $(this).attr('data-follow-id');

                $("span.icon", this).addClass("loading");

                toggleStarred(id);

                return false;
            });

            $element.addClass("data-follow-bound");
        }
    });
}
