function(e, options) {
    e.preventDefault();
    e.stopPropagation();

    var topic = options.topic,
    $form = $('.editor.inline.topics', this),
    newText = $form.find('input[type=text]:first').val() || 'Topic title',
    $inputArchived = $form.find('.archived input[type="checkbox"]'),
    $inputTags = $form.find('.tags input[type="checkbox"]');
 
    delete options.topic;
 
    topic.title = newText
    topic.archived = $inputArchived.is(":checked");

    var tags = [];
    $inputTags.each(function() {

        var cb = $(this);
        if (cb.is(":checked")) {
            tags.push(cb.val());
        }
    });
    
    var filter = API.filterPrepare({topic: topic});
    topic.tags = [];
    tags.forEach(function(tag) {
        if (topic.tags.indexOf(tag) == -1)
            topic.tags.push(tag);
    });

    var DB = API.filterDB(filter);

    DB.saveDoc(topic, options);

    if (API.videoHints && $(this).is(':visible')) {
        API.videoHints.hide();
    }
}
