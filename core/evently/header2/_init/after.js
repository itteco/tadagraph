function() {
    var $this = $(this);
    var $$this = $$(this);
    
    var $header = $('.p-head.sys-topic', this);
    
    var $title      = $header.find('.p-title.hover');
    var $subheader  = $('.p-subhead');
    var $menu       = $('.p-context');
    var $handle     = $title.find('.handle');
    
    var $buttonEdit = $header.find('.button.edit');
    var $formEdit   = $('.editor.inline.topic');
    var $formAdd    = $('.editor.inline.tags');
    
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
            addTags.forEach(function(tag) {
                topic.tags = API.tags.add(tag, topic.tags, tagsDesc, function(tag, rem) {
                    added = tag;
                    $this.find('.sys-tags-list a[rel="' + tag + '"]').parent().toggle(!rem);
                });
            });
            var removed = false;
            removeTags.forEach(function(tag) {
                topic.tags = API.tags.remove(tag, topic.tags, tagsDesc, function(tag, rem) {
                    removed = true;
                    $this.find('.sys-tags-list a[rel="' + tag + '"]').parent().toggle(!rem);
                });
            });
            
            if (added || removed) {
                var DB = API.filterDB({topic: topic});
                DB.saveDoc(topic, {
                    success: function() {
                        if (added)
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

        var editTopic = $$("#id_topics").storedTopics[getFilter().topicId];
        $formEdit.find('input[type=text]:first').val(editTopic.title).focus();

        var archived = $formEdit.find('input[type=checkbox]:first');
        if (editTopic.archived) {
            archived.attr("checked", "checked");
        } else {
            archived.removeAttr("checked");
        }

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
        var editTopic = $$("#id_topics").storedTopics[getFilter().topicId];
        var body = $.trim($formEdit.find('input[type=text]:first').val());
        if (!body || !editTopic) {
            return
        }
        
        var archived = $formEdit.find('input[type=checkbox]:first').is(":checked");
        
        var DB = API.filterDB(getFilter());

        cancelEdit();

        $this.trigger("setTitle", [body]);
        
        topic = $.extend(true, {}, editTopic);
        
        topic.title = body;
        topic.archived = archived;
        
        topic.tags = API.tags.add("todo", topic.tags, API.tags.desc(getFilter()));
        
        DB.saveDoc(topic, {
            success: function() {
                // Update topic in all todos. Need to mark archived.
                DB.view("todo/todos-by-topic", {
                    startkey: topic._id,
                    endkey: topic._id,
                    success: function(data) {
                        var todos = [];
                        data.rows.forEach(function(row) {
                            var doc = row.value;
                            
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