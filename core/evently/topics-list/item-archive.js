function(e) {
    e.stopPropagation();
    
    var $item = $(e.target);
    
    var topic = $$("#id_topics").storedTopics[$item.data("id")];
    
    var hideArchived = API.filterState["hide-archived"];
    
    if (hideArchived) {
        $item.css('background-color', '#FFFCD8');
        $item.slideUp(350, function(){
            $item.remove();
        });
    }
    
    topic.archived = true;
    
    var DB = API.filterDB({topic: topic});
    DB.saveDoc(topic, {
        error: function(status, error, reason) {
        }
    });
}