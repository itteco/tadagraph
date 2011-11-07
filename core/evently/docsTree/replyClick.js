function(e) {
    e.stopPropagation();

    $(this).trigger("reply", [$$($(e.target)).doc]);
}
