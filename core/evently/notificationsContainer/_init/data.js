function(e) {
    e.stopPropagation();
    return {
      contact: getFilter().tag == 'contact'
    };
}
