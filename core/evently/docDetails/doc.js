function(e, doc, isUpdate) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    if (!doc) {
        $this.html("");
        return;
    }

    var sameDoc = $$this.doc && $$this.doc._id == doc._id;
    $$this.doc = doc;
    
    $this.empty();

    var widget = $('<ul class="flow"></ul>');
    $this.append(widget);
    
    createDocWidget(widget, doc, { view: "details" });
    
    if (isUpdate) {
        $this.css('backgroundColor','#fffbdf').animate({
            backgroundColor: '#ffffff'
        }, 2000);
    }
    
    if (!sameDoc) {
        unregisterChangesListener("document details");
        registerChangesListener(API.filterDB({parent: doc}), function(docs) {
            if (!($this.is(":visible")))
                return;
            docs.forEach(function(d) {
                if (d._id == doc._id) {
                    if (d._deleted) {
                        document.location.href = "#";
                    } else {
                        $this.trigger("doc", [d, true]);
                    }
                }
            });
        }, "document details");
    }
}
