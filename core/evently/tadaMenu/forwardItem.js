function(e, $item, space) {
    e.stopPropagation();
    
//    $.log("forwardItem", $item, space);
    
    var id = $item.data("refid");
    if (!API.cachedDocs[id]) {
        // self is not expected error.
        return false; 
    }
    
    var doc = API.cachedDocs[id];
    var spaceDB = API.filterDB({db: space});
    
    var $loader = $item.find('.editor-loader');
    if ($loader.length == 0) {
        $item.append('<div class="editor-loader"></div>');
        $loader = $item.find('.editor-loader');
    }
    
    $item.addClass('state-progress');
    $loader.show();
    
    var creator = API.profile();
    var forwardedDoc = $.extend({}, doc, {
        db: space,
        created_at: new Date(),
        forwarded_info: {
            db: doc.db,
            created_at: doc.created_at,
            by: {
                id: creator.id,
                nickname: creator.nickname
            }
        }
    });
    delete forwardedDoc._rev;
    delete forwardedDoc._id;
    
    if (forwardedDoc.topics) {
        forwardedDoc.topics.forEach(function (topic) {
            topic.db = space;
        });
    }
    
    API.storeStatus(spaceDB, forwardedDoc, {
        success: function() {
            $loader.hide();
            itemHighlight($item, function() {
                $item.removeClass('state-progress');
            });
        },
        error: function(status, error, reason) {
            $.log(status, error, reason);
            $loader.hide();
        }
    });
    
    return false;
}
