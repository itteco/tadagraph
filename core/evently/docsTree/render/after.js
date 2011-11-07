function() {
    var $this = $(this);
    var $$this = $$(this);
    
    var $status = $('#id_inline_form');
    $this.append($status);
    $status.show();
    
    $$this.formInitCallback($status);
    
    var currentTopicId = getFilter().topicId;
    if (!currentTopicId && getFilter().parent && getFilter().parent.topic) {
        currentTopicId = getFilter().parent.topic._id;
    }
    
    var $createHelper = $('.create-helper', this);
    
    var root = $$this.root;
    var rootTopics = [];
    if (root.topic) rootTopics.push(root.topic._id);
    if (root.topics) root.topics.forEach(function(topic) { rootTopics.push(topic._id); });
    
    var items = $$this.items;
    for (var id in items) {
        var doc = items[id];
        var $itemStub = $('li.item-stub[data-id="' + doc._id + '"]', this);
        createDocWidget($createHelper, doc, {
            hideTopics: rootTopics
        });
        var $item = $createHelper.children();
        $item.addClass($itemStub.data('class'));
        $item.data("level", $itemStub.data("level"));
        $itemStub.after($item);
        $itemStub.remove();
        $$($item).doc = doc;
    }
    
    var newItems = $("li.new-item", this);
    newItems.each(function() {
        $(this).find('.fade').hide();
    });
    API.queueNewItems(newItems);
    
    // Problem: item is highlighted but never became normal.
    // TODO: this hardcode corrupts queueNewItems logic, but can't find faster solution.
    newItems.animate({
      backgroundColor: '#ffffff'
    }, 1000, function(){
        newItems.css('background-color','');
      });
    
//    $(".stream.rendered", this).remove();
//    $(".stream.rendering", this).removeClass("rendering").addClass("rendered").show();
    $('.flow', this).show();
}
