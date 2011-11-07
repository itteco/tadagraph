function(e) {
    e.stopPropagation();
    
    var space = $$(this).currentDB;
    
    var $form       = $(this).children('.status-form');
    var $tada       = $form.find('.button-tada');
    var $textarea   = $form.find('.input-status');
    var $spacebox   = $form.find('.spacebox');
    
    $textarea.attr('disabled', false).val('').css('height','').focus();
    $spacebox.selectmenu('enable').selectmenu('value', (space.type && space.name)? (space.type + "::" + space.name): "");
    $tada.button('enable').removeClass('ui-state-progress');
    $form.find('.qq-upload-list').html('');
}
