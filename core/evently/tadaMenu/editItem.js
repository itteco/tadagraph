function(e, $item) {
    e.stopPropagation();
    $('#id_tada_edit').trigger("editItem", [$item]);
}
