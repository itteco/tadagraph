function() {
    var $this = $(this);
    var $$this = $$(this);
    
    var $input = $('.meta-input input', this);
    
    $('[placeholder]', this).placeholder();
    
    var meta = $$this.meta;
    for (var i = 0; i < meta.length; i++) {
        var item = meta[i];
        if (item.removed) {
            var $item = $('.meta-item[data-type="' + item.type + '"][data-value="' + item.id + '"]', $this);
            $item.css('background-color','#f26522').fadeOut(150, function() {
                $(this).remove();
            });
            meta.splice(i, 1); i--;
        }
        
        if (item.added) {
            var $item = $('.meta-item[data-type="' + item.type + '"][data-value="' + item.id + '"]', $this);
            $item.css('background-color','#f26522').animate({
                backgroundColor: '#8c8c8c'
            }, 2000);
            delete item.added;
        }
    }
    
    var useRecent = false;
    
    var terms = $$this.terms;

    // recent tags + hint
    var termsRecent = [
        {label: "", hint:  "Type tag, topic or member"}
    ];

    // autocomplete

    $input.autocomplete({
        source: terms,
        delay: 100
    })
    .focus(function(){
        showRecentTerms();
    })
    .focus();
    $input.data( "autocomplete" )._renderItem = function( ul, item ) {

        // hint
        if ((item.hint != '') && (item.hint !== undefined ))
            return $("<li class='ui-autocomplete-category'>" + item.hint + "</li>")
                .appendTo(ul);

        // remove [] for topics
        var label = stripTopicDelimiter(item.label);

        // highlight search term
        var replacement = this.term;
        label = label.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(replacement) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
        return $("<li></li>")
            .data("item.autocomplete", item)
            .append("<a>" + label + "</a>")
            .appendTo(ul);

    }
    $input.data("autocomplete.menu").menu.options.focus = function(event, ui){
        var self = $input.data("autocomplete");
        var item = ui.item.data( "item.autocomplete" );
        if ( false !== self._trigger( "focus", event, {item: item} ) ) {
            if ( /^key/.test(event.originalEvent.type) ) {
                // remove [] for topics
                var value = stripTopicDelimiter(item.value);
                self.element.val( value );
            }
        }
    };
    $input.autocomplete('widget').addClass('meta');

    $input.bind( "autocompleteselect", function(event, ui) {
        $this.trigger("parse", [ui.item.value]);
//        setTimeout(function() {
//            $input.val($input.val().replace(ui.item.value, ''));
//        },5);
        showRecentTerms();
    });
    
    function showRecentTerms() {
        if ($input.val() == 'dsa') {
            if (!useRecent) {
                useRecent = true;
                $input.autocomplete('option', 'source', getRecentTerms())
                      .autocomplete('option', 'minLength', 0)
                      .autocomplete('search', '');
            }
            
        } else {
            if (useRecent) {
                $input.autocomplete('option', 'source', terms);
                useRecent = false;
            }
        }
    }
    
    function getRecentTerms() {
        return termsRecent.slice(0,6);
    }

    function stripTopicDelimiter(value) {
        value = value.replace(/^\[/,'');
        value = value.replace(/\]$/,'');
        return value;
    }
}
