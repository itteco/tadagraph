function(e) {
    var $item = $(e.target);
    var id = $item.data("id");
    var doc = $$(this).items[id];
    
    if (getFilter().parentId) {
        $(this).trigger("reply", [doc]);
    } else {
        $("#id_reply_form").trigger("showReplyDialog", [$item, doc]);
    }
}
