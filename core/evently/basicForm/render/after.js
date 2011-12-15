function() {
    var self = this;
    var $this = $(this);
    var $$this = $$(this);
    
    var $attachmentManager = $(".attachments-manager", this);
    
    $attachmentManager.evently("attachmentsManager", APPS.core, [this, $this.find(".file-uploader")[0], $this.find(".file-uploader-list")[0]]);
    $.evently.connect($this, $attachmentManager, ["spaceChanged"]);
    
    var $form       = $('.status-form', this);
    var $tada       = $form.find('.button-tada');
    var $textarea   = $form.find('.input-status');
    var $spacebox   = $form.find('.spacebox');

    // status message
    initFlowStatusForm();
    
    /* ---------------------------------------------------------- */
    /* Status form */
    
function initFlowStatusForm() {
        
    // textarea
    $textarea.elastic();
    
    var $spacebox_open = false;
 
    // space
    if(!$$this.inline)
    $spacebox.selectmenu({
        style: 'dropdown',
        width: $spacebox.outerWidth(),
        select: function(){
            $spacebox_open = false;
        },
        change: function(e, item) {
            var value = item.value;

            var oldDB = $$this.currentDB;
            var pieces = value.split("::");

            if (pieces.length == 2) {
                $$this.currentDB = {
                    name: pieces[1],
                    type: pieces[0]
                };
            } else {
                $$this.currentDB = {
                    name: "",
                    type: ""
                };
            }

            $this.trigger("spaceChanged", [$this, $$this.currentDB, oldDB]);

            // Clear reply if project changed.
            if ($$this.replyTo &&
                ( 
                $$this.replyTo.db.type != $$this.currentDB.type ||
                $$this.replyTo.db.name != $$this.currentDB.name)) {

                $this.trigger("clearReply");
            }
        }
    });
    var space = getFilter().db;
    $spacebox.selectmenu('value', (space.type && space.name)? (space.type + "::" + space.name): "");
    
    $('a.ui-selectmenu.spacebox', self).hover(
        function(){
            $spacebox_open = true;
            show_spacebox();
        },
        function(){
            $spacebox_open = false;
        }
    );
    
    $('.ui-selectmenu-menu-dropdown.spacebox', self).hover(
        function(){
            
        },
        function(){
            $spacebox_open = true;
            hide_spacebox();
        }
    );
    
    function show_spacebox() {
        setTimeout(function(){
            if ($spacebox_open) {
                $spacebox.selectmenu('open');
                $spacebox_open = true;
            }
        },1000);
    }
    
    function hide_spacebox() {
        setTimeout(function(){
            if ($spacebox_open) {
                $spacebox.selectmenu('close');
                $spacebox_open = false;
            }
        },1000);
    }

    // tada
    $tada.button();

    initInputSuggest();
}
    
function initInputSuggest() {
    /*
    *****************
      Autocomplete.
    *****************
    */

    var acMode      = false;
    var acTerm      = false;

    var ac = {
        topic: {
            pattern:    /\[(.*)$/, //  word boundary dilema: maybe /\[(\w*)$/ or /\[(\S*)$/, but the suggested solution should work too because of extra checks on parsing for meta data.
            prefix:     '[',
            suffix:     '] ',
            getData: function(callback) {
                var that = this;
                var currentDB = $$this.currentDB;
                var filter = {db: currentDB};
                var hasSpace = !(currentDB.name && currentDB.type);
                
                API.filterTopics(filter, function(error, topics) {
                    var result = [];
                    that.items = topics;
                    $.forIn(topics, function(topicId, topic) {
                        if (!topic.archived) {
                            if (hasSpace)
                                result.push(topic.title + " (in " + topic.db.name + ")");
                            
                            else
                                result.push(topic.title);
                        }
                    });
                    result.sort();
                    callback(result);
                });
            },
            prepareValue: function(value) {
                // TODO: here is a bug. Inserts topic like [hoho123 (in cosmos)]
                var items = this.items;
                
                var currentDB = $$this.currentDB;
                var hasSpace = !(currentDB.name && currentDB.type);
                if (hasSpace) {
                    $.forIn(items, function(topicId, topic) {
                        if (value == topic.title + " (in " + topic.db.name + ")") {
                            $spacebox.selectmenu("value", topic.db.type + "::" + topic.db.name);
                            value = topic.title;
                        }
                    });
                }
                
                return value;
            }
        },
        member: {
            pattern:    /@(\w*)$/,
            prefix:     '@',
            suffix:     ' ',
            getData: function(callback) {
                var currentDB = $$this.currentDB;
                if (currentDB.name && currentDB.type) {
                    var space = API.filterSpace({db: { type: currentDB.type, name: currentDB.name}}); // TODO: hide db
                    if (space) {
                        var result = [];
                        space._allMembers.forEach(function(userid) {
                            var profile = API.profile(userid);
                            if (profile)
                                result.push(profile.nickname);
                        })
                        callback(result);
                        return;
                    }
                }
                callback([]);
            }
        },
        hashtag: {
            pattern:    /#(\w*)$/,
            prefix:     '#',
            suffix:     ' ',
            getData: function(callback) {
                var that = this;
                var filter = {db: $$this.currentDB}; // TODO: hide db
                var predefined = API.tags.desc(filter);
                
                var list = [];
                for (var tag in predefined) {
                    if (!predefined[tag].hidden)
                        list.push(tag);
                }
                
                API.filterTags(filter, function(error, items) {
                    if (error) {
                        console.error(error);
                        
                    } else {
                        var hasSpace = items.length && items[0].space && true;
                        items.forEach(function(item) {
                            if (!(item.tag in predefined)) {
                                if (hasSpace) {
                                    list.push(item.tag + " (in " + item.space.name + ")");

                                } else {
                                    list.push(item.tag);
                                }
                            }
                        });
                        that.items = items;
                    }
                
                    list.sort();
                    callback(list);
                });
            },
            prepareValue: function(value) {
                var items = this.items;
                if (items) {
                    var hasSpace = items.length && items[0].space && true;
                    if (hasSpace) {
                        items.forEach(function(item) {
                            if (value == item.tag + " (in " + item.space.name + ")") {
                                value = item.tag;
                                $spacebox.selectmenu("value", item.space.type + "::" + item.space.name);
                            }
                        });
                    }
                }
                return value;
            }
        }
    }

    // try all patterns
    function detectTag(text) {
        for (var obj in ac) {
            var result = text.match(ac[obj].pattern);
            if (result != null) {
                acMode = obj;
                acTerm = result[1];
                return true;
            }
        }
        acMode = false;
        acTerm = false;
        return false;
    }

    if (typeof jQuery().autocomplete != 'undefined')
    $textarea.keydown(function(event) {
        var isOpen = $textarea.autocomplete("widget").is(":visible");
        var keyCode = $.ui.keyCode;
        if (!isOpen && (event.keyCode == keyCode.UP || event.keyCode == keyCode.DOWN)) {
            event.stopImmediatePropagation();
        }
    }).autocomplete({
        minLength: 0,

        // search
        source: function( request, response ) {
            if (acMode) {
                request.term = acTerm;
                ac[acMode].getData(function(dict) {
                    response($.ui.autocomplete.filter(dict, acTerm ));
                });
                
            } else {
                return false;   
            }
        },

        // detect tags and perform search
        search: function(event, ui) {
            if (detectTag(this.value)) {
                return true;
            }
            $(this).autocomplete("close");
            return false;
        },

        // prevent value inserted on focus
        focus: function() {
            return false;
        },

        // select
        select: function( event, ui ) {
            var replaceValue = ac[acMode].prefix + ui.item.value + ac[acMode].suffix;
            var placedValue = ac[acMode].prepareValue? (ac[acMode].prefix + ac[acMode].prepareValue(ui.item.value) + ac[acMode].suffix): replaceValue;
            var pattern = ac[acMode].pattern;
            var text = this.value;
            text = text.replace(pattern, replaceValue);
            this.value = text.replace(replaceValue, placedValue);
            return false;
        }
    });
    
    
    // crm status

    $form.find('.radio-group input').change(function(){
        var $item = $(this);
        $form.find('label').removeClass('selected');
        if ($item.attr('checked')) {
            $item.parent().addClass('selected');
        }
    });
 
}
}
