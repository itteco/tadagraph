function(e) {
  e.preventDefault();
  e.stopPropagation();

  $('span.hint', this).hide();
}
