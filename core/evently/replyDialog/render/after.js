function() {
    var $this = $(this);
    var $$this = $$(this);
    
    var $dialog = $$.dialog = $('.tdialog.titem.reply', this);
    
    var $typeSelect = $dialog.find('.sys-private-options select');
    
    if ($dialog.size() == 0)
        return;

    //initFileUploader('reply-file-uploader');

    // controls
    var $button = $dialog.find('.controls .button-submit').button();
    var $sampler    = $('.editor-sampler.flow .item');
    
    // dialog
    $dialog.dialog({
        title: 'Reply to',
        dialogClass: 'tdialog titem reply',
        width: 690,
        height: 'auto',
        resizable: false,
        hide: 'fade',
        autoOpen: false,
        close: function() {
            $attachmentManager.trigger("formClosed", [$this]);
        }
    });
    
    var $attachmentManager = $dialog.find(".attachments-manager");
    $attachmentManager.evently("attachmentsManager", APPS.core, [this, $dialog.find(".file-uploader")[0], $dialog.find(".file-uploader-list")[0]]);

    var member;
    
    // open dialog
    $$this.openDialog = function($item_) {
        $attachmentManager.trigger("formClosed", [$this]);
        
        var parentDoc = $$this.parentDoc;
        if (parentDoc.type == "person") {
            $$this.currentDB = {type: "person", name: API.username()};
        } else {
            $$this.currentDB = parentDoc.db;
        }
        
        if ($item_) {
            var $item = $item_.clone();
            $item.removeClass('hover').removeClass('state-hover');
            $item.find('.item-context').remove();
            $item.find('.button.details').remove();
            $item.find('.button.star').remove();
            
            member = $item.find('.col.heading .member').text();
            
            var profile = API.profile();
            $dialog.find('.reply-form .avatar').attr("src", API.avatarUrl(profile.id)).attr("title", profile.nickname);
            
            var title = 'Reply to ' + member;
            $dialog.dialog('option', 'title', title);
            
            $dialog.find('.flow').show().html('').append($item);
            $dialog.find('.sys-private-options').hide();
        } else {
            $dialog.find('.reply-form .avatar').attr("src", API.avatarUrl(parentDoc.id)).attr("title", parentDoc.nickname);
            
            var title = API.getFirstAttribute(parentDoc, "Full name", parentDoc.nickname);
            $dialog.dialog('option', 'title', title);
            
            $dialog.find('.sys-private-options').show();
            $dialog.find('.flow').hide();
        }
        
        $dialog.dialog('open');
        $dialog.find('.flow a').click(function() {
            $dialog.dialog('close');
        });

        resetForm();
        $textarea.focus().removeClass('placeholder');
    };


    var $textarea = $dialog.find('textarea.input');
    $textarea.elastic();
    
    initInputSuggest();

    // submit on ctrl + enter
    $textarea.keydown(function(event){
        if (event.ctrlKey && (event.keyCode == 13 || event.keyCode == 10)) {
            processForm();
        }
    });

    // submit on click
    $button.click(function(){
        processForm();
        return false;
    });
    
    $$this.updateSubmitLabel = function() {
        if ($$this.parentDoc.type == "person") {
            if ($typeSelect.val() == "#dm ") {
                $button.button('option', "label", "Send");
            } else {
                $button.button('option', "label", "Save");
            }
        } else {
            $button.button('option', "label", "Reply");
        }
    };
    
    $typeSelect.change($$this.updateSubmitLabel);

    function processForm() {
        var message = $.trim($textarea.val());
        if ((message == '') || (message == $textarea.attr('placeholder'))) {
            $textarea.focus();
            return;
        }
        
        $this.trigger("submitForm", [message, $$this.parentDoc]);
        
        $dialog.dialog('close');
    }


    function resetForm() {
        $textarea.css('height','').val('');
        $dialog.find('.qq-upload-list').html('');
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
    }
}