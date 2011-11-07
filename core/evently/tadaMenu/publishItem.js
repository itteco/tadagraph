function(e, $item, $button) {
    e.stopPropagation();
    
    $("#id_publish_dialog").trigger("showPublishDialog", [$button]);
}
