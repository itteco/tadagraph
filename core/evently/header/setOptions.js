function(e, options) {
    var self = this,
        $self = $(this);
    
    $(".primary", this).show();
    $(".editor.inline.topic", this).hide();
    
    if (options.contact) {
        $('>div.page-head', this).show();
        $('>div.page-header', this).hide();
    } else {
        $('>div.page-head', this).hide();
        $('>div.page-header', this).show();
    }

    if (options.title)
        $self.trigger("setTitle", [options.title]);
    
    /*
    if (options.avatarUrl) {
        $("img", this).attr("src", options.avatarUrl).show();
    } else {
        $("img", this).hide();
    }
    */
    
    var html = '';
    if (options.links) {
        var selectAfter = false;
        options.links.forEach(function(link) {
            if (link.hide)
                return;
                
            var selected = "";
            var style = link.style || "";
            if (link.selected) {
                selected = 'selected';
            } else if (selectAfter) {
                selected = 'selected-after';
            }
            selectAfter = link.selected;
            
            var url;
            if (link.selected && options.timeline) {
                url = options.timeline;
            } else {
                url = link.url;
            }
            
            html += '<li class="' + selected + '"><a href="' + url + '" class="switch-link ' + style + '">' + link.title + '</a></li>';
        });
    }
    
    $(".views.linkset", this).html(html);
    
    if (options.filter && options.filter.topic && options.filter.topic.db) {
        var menuLinks = getTopicTagsMenu(options.filter.topic, options.filter);
        var selectAfter = false;
        var html = '';
        menuLinks.forEach(function(link) {
            if (link.hide)
                return;
                
            var selected = "";
            if (link.selected) {
                selected = 'selected';
            } else if (selectAfter) {
                selected = 'selected-after';
            }
            selectAfter = link.selected;
            
            var url = link.url;
            
            html += '<li class="' + selected + '"><a href="' + url + '" data-tag="' + link.tag + '">' + link.title + '</a></li>';
        });
        $(".navigation.topic-tags .tags.linkset", this).html(html);
        
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
        
        if (getPossibleTopicTagsToAdd(options.filter.topic).length > 0) {
            $(".navigation.topic-tags .button-add.tag", this).show();
        } else {
            $(".navigation.topic-tags .button-add.tag", this).hide();
        }
        
        html = "";
        menuLinks.forEach(function(link, i) {
            if (i > 0) 
                html += '<label><input type="checkbox" ' + (link.hide? '': 'checked="checked"') + ' value="' + link.tag + '"> ' + link.title + '</label>';
        });
        
        $(".editor.inline.tags .td.tags", this).html(html);
        
        $(".navigation", this).hide();
        $(".navigation.topic-tags", this).show();
        
        $(this).trigger('setCustomButtons', [options.customButtons]);
        
    } else {
        $(".navigation.topic-tags", this).hide();
        $(this).trigger('setCustomButtons', [options.customButtons]);
    }
    
    var $navThreads = $(".navigation.threads", this);
    if (options.filter && options.filter.tag == "threads") {
        $navThreads.show().find(".button-new").show();
        
    } else {
        $navThreads.hide();
    }
    
    $(".editor.inline.tags", this).hide();
    
    $(".primary .opt .actions", this).html(options.actions || "");
    
    if (options.actions || html) {
        $(".primary .opt", this).show();
    } else {
        $(".primary .opt", this).hide();
    }
    
    if (options.headerClass) {
        $(".page-header", this).attr("class", "page-header " + options.headerClass);
    } else {
        $(".page-header", this).attr("class", "page-header");
    }
    
    if (options.hideContext) {
        $(".page-header .context", this).hide();
        
    } else {
        $(".page-header .context", this).show();
    }
    
    textCrop(this);
}
