function(e) {
    e.stopPropagation();
    
    var $form       = $(this).children('.status-form');
    var $tada       = $form.find('.button-tada');
    var $textarea   = $form.find('.input-status');
    var $spacebox   = $form.find('.spacebox');
    
    $textarea.attr('disabled', true);
    $spacebox.selectmenu('disable');
    $tada.button('disable').addClass('ui-state-progress');
}
