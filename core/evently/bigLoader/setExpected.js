function(e, expected) {
  e.preventDefault();
  e.stopPropagation();

  $$(this).expected = expected;
}
