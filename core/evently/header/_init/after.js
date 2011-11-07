function() {
    var $this = $(this);
    var $$this = $$(this);
    
    var $fTags = $(".editor.inline.tags", this);
    var $cPageHead = $(".context", this);
    
    $('.navigation.threads .button-new', this).click(function(e) {
        e.preventDefault();
        
        $this.trigger("startThread", [this]);
    });
    
    // edit
    $('.button-add.tag', this).live('click', function(){
        $cPageHead.hide();
        $fTags.show().find('input[type="checkbox"]:not(:disabled)').focus();
        return false;
    });

    // cancel
    $fTags.find('.editor-cancel').click(function(){
        tagsEditClose();
        return false;
    });
    $fTags.keydown(function(event){
        if (event.keyCode == 27) {
            tagsEditClose();
        }
    });

    // save
    $fTags.find('.editor-save').click(function(){
        tagsEditSave();
        return false;
    });
    $fTags.keydown(function(event){
        if (event.keyCode == 13) {
            tagsEditSave();
        }
    });
    function tagsEditSave() {
        tagsEditClose();
        
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
                    $this.find('.navigation.topic-tags .tags.linkset a[rel="' + tag + '"]').parent().toggle(!rem);
                });
            });
            var removed = false;
            removeTags.forEach(function(tag) {
                topic.tags = API.tags.remove(tag, topic.tags, tagsDesc, function(tag, rem) {
                    removed = true;
                    $this.find('.navigation.topic-tags .tags.linkset a[rel="' + tag + '"]').parent().toggle(!rem);
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

    // close
    function tagsEditClose() {
        $fTags.hide();
        if ($cPageHead) {
            $cPageHead.show();
        }
    }

    /* ************************************************************************************************************** */
    /* Topic
    /* ************************************************************************************************************** */

    //$cPageTitle = $('.page-header.topic.todo .primary');
    initListItem($('.page-header.topic .primary', this));
    
    function initListItem($element) {
        $element.append('<div class="editor-loader"></div>');
    }
    

    /* *****************************************************************************************************************
       Topic: Menu   */
    
    var $mTopic     = $('.editor-menu.topic', this);
    var $fTopic     = $('.editor.inline.topic', this);
    var $cHeader = null;
    
    $('.page-header .primary.hover', this).bind('mouseenter mouseleave', function(event){
        var $item = $(this);
        if (event.type == 'mouseenter' && getFilter().topic) {
            $item.find('h1').append($mTopic);
            $mTopic.show();
        }
        else {
            $mTopic.hide();
        }
    });


    /* *****************************************************************************************************************
       Topic: Edit   */

    $this.click(function(e) {
        var $item = $(e.target);
        if ($item.is('.editor-edit')) {
            $cHeader = $item.parents().eq(7);

            $cHeader.hide().after($fTopic);
            $fTopic.show();

            var editTopic = $$("#id_topics").storedTopics[getFilter().topicId];
            $fTopic.find('input[type=text]:first').val(editTopic.title).focus();

            var archived = $fTopic.find('input[type=checkbox]:first');
            if (editTopic.archived) {
                archived.attr("checked", "checked");
            } else {
                archived.removeAttr("checked");
            }

            return false;
        }
    });


    /* *****************************************************************************************************************
       Topic: Cancel   */
    
    $fTopic.find('.editor-cancel').click(function(){
        topicEditClose();
        return false;
    });
    $fTopic.keydown(function(event){
        if (event.keyCode == 27) {
            topicEditClose();
        }
    });
    
    /* *****************************************************************************************************************
       Topic: Save   */


    $fTopic.find('.editor-save').click(function(){
        topicEditSave();
        return false;
    });
    $fTopic.keydown(function(event){
        if (event.keyCode == 13) {
            topicEditSave();
        }
    });
    function topicEditSave() {
        var editTopic = $$("#id_topics").storedTopics[getFilter().topicId];
        var body = $fTopic.find('input[type=text]:first').val();
        if (!body || !editTopic) {
            return
        }
        
        var archived = $fTopic.find('input[type=checkbox]:first').is(":checked");
        
        var DB = API.filterDB(getFilter());

        topicEditClose();

        var $item = $cHeader;
        var $loader = $item.find('.editor-loader');
        $cHeader.find('h1 .text.wrapper').text(body);

        $item.addClass('state-progress');
        $loader.show();
        
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
                $cHeader.find('h1 .text.wrapper').text(editTopic.title);
                $loader.hide();
                $item.removeClass('state-progress');
                
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
    
    function topicEditClose() {
        $fTopic.hide();
        if ($cHeader) {
            $cHeader.show();
        }
    }
}