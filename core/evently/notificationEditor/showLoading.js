function(e) {
    e.stopPropagation();
    
    var $button = $('.submit', this);
    $button.width($button.width()).attr('disabled', true).addClass('loading');
}
