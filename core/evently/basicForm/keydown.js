function(event) {
    var $this = $(this);
    
    if (event.ctrlKey && (event.keyCode == 13 || event.keyCode == 10)) {
        $this.trigger("submitForm");
        return;
    }
    if (event.keyCode == 27) {
        $this.trigger("resetForm");
        return;
    }
}
