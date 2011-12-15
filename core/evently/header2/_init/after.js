function() {
    var $this = $(this);
    var $$this = $$(this);
    
    var $header = $('.p-head.sys-topic', this);
    
    var $title      = $header.find('.p-title.hover');
    var $subheader  = $('.p-subhead');
    var $menu       = $('.p-context');
    var $handle     = $title.find('.handle');
    
    var $buttonEdit = $header.find('.button.edit');
    var $formEdit   = $this.find('.editor.inline.topic');
    var $formAdd    = $this.find('.editor.inline.tags');
    
    // add
    $$this.buttonAddClick = function(){
        cancelAll();
        $subheader.hide().after($formAdd);
        $formAdd.show().find('input[type="checkbox"]:not(:disabled)').focus();
        return false;
    };

    // add cancel
    $formAdd.find('.editor-cancel').click(function(){
        cancelAdd();
        return false;
    });
    $formAdd.keydown(function(event){
        if (event.keyCode == 27) {
            cancelAdd();
        }
    });

    // add save
    $formAdd.find('.editor-save').click(function(){
        tagsEditSave();
        return false;
    });
    $formAdd.keydown(function(event){
        if (event.keyCode == 13) {
            tagsEditSave();
        }
    });
    function tagsEditSave() {
        cancelAdd();
        
        var addTags = [];
        var removeTags = [];
        
        $('input[type="checkbox"]', $this).each(function() {
            var cb = $(this);
            if (cb.is(":checked")) {
                addTags.push(cb.attr("value"));
            } else {
                removeTags.push(cb.attr("value"));
            }
        });
        
        var filter = getFilter();
        getTopic(filter, filter.topicId, function(topic) {
            var tagsDesc = API.tags.desc(filter);
            var added = null;
            if (!topic.tags)
                topic.tags = [];
            addTags.forEach(function(tag) {
                if (topic.tags.indexOf(tag) == -1) {
                    topic.tags.push(tag);
                    added = tag;
                    $this.find('.sys-tags-list a[data-tag="' + tag + '"]').parent().show();
                }
            });
            var removed = false;
            removeTags.forEach(function(tag) {
                if (topic.tags.indexOf(tag) > -1) {
                    arrayRemove(topic.tags, tag);
                    removed = true;
                    $this.find('.sys-tags-list a[data-tag="' + tag + '"]').parent().hide();
                }
            });
            
            if (added || removed) {
                var DB = API.filterDB({topic: topic});
                DB.saveDoc(topic, {
                    success: function() {
                        document.location.href = getUrlByFilter({topic: topic, tag: added});
                    }});
            }
        });
    }

    /* *****************************************************************************************************************
       Topic: Edit   */

    $buttonEdit.click(function(e) {
        cancelAll();
        
        $header.hide().after($formEdit);
        $formEdit.show();

        API.filterTopics(getFilter(), function(_error, topics) {
            var editTopic = topics[getFilter().topicId];
            $formEdit.find('input[type=text]:first').val(editTopic.title).focus();

            var archived = $formEdit.find('input[type=checkbox]:first');
            if (editTopic.archived) {
                archived.attr("checked", "checked");
            } else {
                archived.removeAttr("checked");
            }
        });

        return false;
    });


    /* *****************************************************************************************************************
       Topic: Cancel   */
    
    $formEdit.find('.editor-cancel').click(function(){
        cancelEdit();
        return false;
    });
    $formEdit.keydown(function(event){
        if (event.keyCode == 27) {
            cancelEdit();
        }
    });
    
    /* *****************************************************************************************************************
       Topic: Save   */


    $formEdit.find('.editor-save').click(function(){
        topicEditSave();
        return false;
    });
    $formEdit.keydown(function(event){
        if (event.keyCode == 13) {
            topicEditSave();
        }
    });
    function topicEditSave() {
        API.filterTopics(getFilter(), function(_error, topics) {
            var editTopic = topics[getFilter().topicId];
            var body = $.trim($formEdit.find('input[type=text]:first').val());
            if (!body || !editTopic) {
                return
            }

            var archived = $formEdit.find('input[type=checkbox]:first').is(":checked");

            var DB = API.filterDB(getFilter());

            cancelEdit();

            $this.trigger("setTitle", [body]);

            var topic = $.extend(true, {}, editTopic);

            topic.title = body;
            topic.archived = archived;

            topic.tags = API.tags.add("todo", topic.tags, API.tags.desc(getFilter()));

            DB.saveDoc(topic, {
                success: function() {
                    // Update topic in all todos. Need to mark archived.
                    DB.view("todo/todos-by-topic", {
                        startkey: topic._id,
                        endkey: topic._id,
                        include_docs: true,
                        success: function(data) {
                            var todos = [];
                            data.rows.forEach(function(row) {
                                var doc = row.doc;

                                // Move .topic
                                if (doc.topic) {
                                    var idx = findTopic(doc.topics, doc.topic);
                                    if (idx == -1) {
                                        doc.topics.push(doc.topic);
                                    }
                                    delete doc["topic"];
                                }

                                // Replace .topics 
                                var idx = findTopic(doc.topics, topic);
                                if (idx > -1) {
                                    doc.topics[idx] = topic;
                                }
                                $$this.items[doc._id] = doc;
                                todos.push(doc);
                            });

                            DB.bulkSave(todos);
                            /*
                            $loader.hide();
                            itemHighlight($item, function(){
                                $item.removeClass('state-progress');
                            });*/
                        }
                    });
                }, error: function(status, error, reason) {
                    $this.trigger("setTitle", [editTopic.title]);

                    // Error. How to show?
                    alert(reason);
                }
            });

            function findTopic(topics, topic) {
                if (!topic || !topics)
                    return -1;
                for(var i = 0; i < topics.length; i++) {
                    if (topics[i]._id == topic) {
                        return i;
                    }
                }
                return -1;
            }
        });
    }
    
    // hover
    $title.bind('mouseenter mouseleave', function(event){
        if (event.type == 'mouseenter') {
            $title.addClass('state-hover');
        }
        else {
            $title.removeClass('state-hover');
        }
    });

    // open/close
    if ($menu.size()) {
        $title.click(function(event){
            if ($title.hasClass('state-active')) {
                menuClose();
            }
            else {
                cancelAll();
                menuOpen();
                $('body').click(function(event){

                    // hack for datepicker
                    if ($(event.target).hasClass('ui-icon-circle-triangle-e') ||
                            $(event.target).hasClass('ui-icon-circle-triangle-w') ) {
                        return;
                    }

                    menuClose();
                });
                event.stopPropagation();
            }
        });
    }

    function menuOpen() {
        $title.addClass('state-active');
        $handle.removeClass('arrow-down').addClass('arrow-up');
        
        $menu.css('width', '');
        $menu.show();
        
        var width = $title.width();
        if ($menu.width() < width) {
            $menu.width(width - 13);
        }
        else {
            $menu.css('width', '');
        }
    }

    function menuClose() {
        $title.removeClass('state-active');
        $handle.addClass('arrow-down').removeClass('arrow-up');
        $menu.hide();
        $('body').unbind('click');
    }
    
    function cancelEdit() {
        $header.show();
        $formEdit.hide();
    }
    
    function cancelAdd() {
        $subheader.show();
        $formAdd.hide();
    }
    
    function cancelAll() {
        menuClose();
        cancelEdit();
        cancelAdd();
    }
}