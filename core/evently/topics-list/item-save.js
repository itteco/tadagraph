function (e) {
    e.stopPropagation();
    
    var $this = $(this);
    
    var $item = $(e.target);
    var $form = $('.editor.inline.topics', this);
    var newText = $form.find('input[type=text]:first').val() || 'Topic title';
    
    $item.find('.content a').text(newText);
    
    API.filterTopics(getFilter(), function(_error, topics) {
        var profile = API.profile();
        var topic = topics[$item.data("id")] || {
            _id: uuid(),
            archived: false,
            created_at: new Date,
            created_by: {
                id: profile.id,
                nickname: profile.nickname
            },
            db: getFilter().db,
            tags: [],
            ver: 1,
            type: 'topic'
        };

        var $loader = $item.find('.editor-loader');

        $item.attr('data-id', topic._id);
        $item.addClass('state-progress');
        $loader.show();

        $this.trigger('create-topic', [{
            topic: topic,
            success: function() {
            // TODO: Widget should be rerendered
            },
            error: function(status, error, reason) {
                $loader.hide();
                itemHighlight($item, function() {
                    $item.removeClass('state-progress');
                });
            }
        }]);
    });
}
