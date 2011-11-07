function(e, $item) {
    e.stopPropagation();
    
    var $list = $item.parent();
    
    var id = $item.data("id");
    if (!API.cachedDocs[id]) {
        // self is not expected error.
        return false;
    }
    
    var doc = API.cachedDocs[id];
    
    var $loader = $item.find('.editor-loader');
    if ($loader.length == 0) {
        $item.append('<div class="editor-loader"></div>');
        $loader = $item.find('.editor-loader');
    }
    
    $item.addClass('state-progress');
    $loader.show();
    
    var DB = API.userDB();
    
    doc._deleted = true;
    DB.saveDoc(doc, {
        error: function(status, error, reason) {
            if (status == 200) {
	            $loader.hide();
	            $item.css('background-color','#fffcd8');
	            $item.slideUp(250, function(){
	                $item.remove();
	            });
            } else {
                $loader.hide();
                $item.removeClass('state-progress');
            }
        }
    });
    return true;
}
