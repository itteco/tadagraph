function(e, options) {
    var self = this,
        $self = $(this),
        $$this = $$(this);
    
    $(".editor.inline.topic", this).hide();
    
    if (options.title)
        $self.trigger("setTitle", [options.title]);
    
    if (options.filter && options.filter.topic && options.filter.topic.db) {
        $('.sys-topic', this).show();
        $('.sys-simple', this).hide();
        
        var menuLinks = getTopicTagsMenu(options.filter.topic, options.filter);
        var html = '';
        var hiddenTags = false;
        
        menuLinks.forEach(function(link) {
            if (link.hide) {
                hiddenTags = true;
                return;
            }
                
            var url = link.url;
            
            html += '<li class="item"><a ' + (link.selected ? 'class="selected"' : '') + ' href="' + url + '" data-tag="' + link.tag + '">' + link.title + '</a></li>';
        });
        
        if (hiddenTags) {
            html += '<li class="item"><a href="#" class="extra" rel="add-tag">+ add</a></li>';
        }
        
        $(".sys-tags-list", this).html(html);
        
        var buttonAdd = $('.sys-tags-list a[rel="add-tag"]', this);
        buttonAdd.click($$this.buttonAddClick);
        
        var DB = API.filterDB(options.filter);
        function reloadEntitiesCount() {
            DB.view("core/topic-entities-count", {
                startkey: [options.filter.topic._id],
                endkey: [options.filter.topic._id, "\ufff0"],
                group: true,
                success: function(data) {
                    data.rows.forEach(function(row) {
                        var tag = row.key[1];
                        var html = ' <span>(' + row.value + ')</span>';
                        var link = $('[data-tag="' + tag + '"]', self);
                        link.find("span").remove();
                        link.append(html);
                    });
                }
            });
        }
        
        reloadEntitiesCount();
        
        API.unregisterChangesListener("new topic entity");
        API.registerChangesListener(DB, function(docs) {
            if (!$self.is(":visible"))
                return;
            var possibleChange = false;
            docs.forEach(function(doc) {
                if (doc._deleted || (doc.db.name == DB.name && doc.db.type == DB.type)) {
                    possibleChange = true;
                }
            });
            if (possibleChange)
                reloadEntitiesCount();
        }, "new topic entity");
        
        html = "";
        menuLinks.forEach(function(link, i) {
            if (i > 0) 
                html += '<label><input type="checkbox" ' + (link.hide? '': 'checked="checked"') + ' value="' + link.tag + '"> ' + link.title + '</label>';
        });
        
        $(".editor.inline.tags .td.tags", this).html(html);
        
        API.filterTopics(options.filter, function(_error, topics) {
            $self.trigger('renderTopics', [topics]);
        });
    } else {
        $('.sys-topic', this).hide();
        $('.sys-simple', this).show();
    }
    $(".editor.inline.tags", this).hide();
    
    if (options.headerClass) {
        $(".p-head.sys-topic", this).attr("class", "p-head sys-topic " + options.headerClass);
        $(".p-head.sys-simple", this).attr("class", "p-head sys-simple " + options.headerClass);
    } else {
        $(".p-head.sys-topic", this).attr("class", "p-head sys-topic");
        $(".p-head.sys-simple", this).attr("class", "p-head sys-simple");
    }
    
    textCrop(this);
}
