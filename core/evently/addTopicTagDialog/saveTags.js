function(e) {
    e.stopPropagation();
    
    var $button = $(".submit", $$(this).dialog);
    var elem = this;
    var tags = [];
    
    $('input[type="checkbox"]', $$(this).dialog).each(function() {
        var cb = $(this);
        if (cb.is(":checked")) {
            tags.push(cb.attr("value"));
        }
    });
    
    var validator = $('div.validator', $$(this).dialog);
    if (tags.length == 0) {
        validator.show();
        return;
    }
    validator.hide();
    
    
    buttonSubmitStart($button);
    
    var filter = getFilter();
    
    getTopic(filter, filter.topicId, function(topic) {
        tags.forEach(function(tag) {
            topic.tags = API.tags.add(tag, topic.tags, API.tags.desc(filter));
        });
        
        var DB = API.filterDB({topic: topic});
        DB.saveDoc(topic, {
            success: function() {
                buttonSubmitEnd($button);
                
                $$(elem).button.removeClass('selected');
                $$(elem).dialog.dialog('close');
                
                document.location.href = getUrlByFilter(getFilterWithTag(filter, tags[0]));
            }});
    });
    
    function buttonSubmitStart($button) {
        $button.width($button.width()).attr('disabled',true).addClass('loading');
    }
    
    function buttonSubmitEnd($button) {
        $button.attr('disabled',false).removeClass('loading');
    }
}