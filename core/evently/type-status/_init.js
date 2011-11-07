function (e, doc, options) {
    e.stopPropagation();
    
    var $this = $(this);
    var $$this = $$(this);
    
    $$this.doc = doc;
    
    $$this.options = options = options || {};
    
    var view = options.view? options.view: "regular";
    
    if (!($$(document).showdown_converter))
        $$(document).showdown_converter = new Showdown.converter();
    
    $this.trigger("render-" + view);
}
