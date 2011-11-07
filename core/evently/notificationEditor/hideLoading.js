function(e) {
    e.stopPropagation();
    
    var $button = $('.submit', this);
    $button.attr('disabled', false).removeClass('loading');
}