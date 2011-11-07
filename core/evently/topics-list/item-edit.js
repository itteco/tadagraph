function(e) {
    e.stopPropagation();
    
    var $form = $('.editor.inline.topics', this);
    
    $form.trigger('item-editor-close');
    
    var $item = $$(this).editableItem = $(e.target);
    
    if (!$item) {
        $.log("connot find item");
        return false;
    }

    var topic = $$("#id_topics").storedTopics[$item.data("id")];
    
    $item.hide().after($form);
    if (topic.archived) {
        $('.archived input[type="checkbox"]', $form).attr("checked", "checked");
    } else {
        $('.archived input[type="checkbox"]', $form).removeAttr("checked");
    }

    var $tags = $('.tags', $form);
    $tags.html("");
    getTopicTagsMenu(topic).forEach(function(tagMenu, i) {
        if (i > 0) { // skip flow item
            var $tagItem = $($.mustache('<label><input type="checkbox" value="{{tag}}"/>{{title}}</label>', {
                tag: tagMenu.tag,
                title: tagMenu.title
            }));
            if (!tagMenu.hide)
                $tagItem.find('input').attr("checked", "checked");
            
            $tags.append($tagItem);
        }
    });

    $form.show();
    $form.find('input[type=text]:first').val($.trim(topic.title)).focus();
    
    return false;
}
