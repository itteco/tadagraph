function (e, doc, options) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    $$this.doc = doc;
    $$this.currentDB = doc.db;
    
    $$this.options = options = options || {};
    
    var view = options.view? options.view: "regular";
    
    if (!($$(document).showdown_converter))
        $$(document).showdown_converter = new Showdown.converter();
    
    API.filterTopics(doc, function(_error, topics) {
        $this.trigger("render-" + view, [topics]);
    });
}
