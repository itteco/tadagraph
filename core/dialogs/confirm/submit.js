function(e, $dialog, callback) {
    e.stopPropagation();
    var $this = $(this);

    $this.trigger('loading',true);
    callback && callback(true, {}, function(error) {
        $this.trigger('loading',false);
        if (error) {
            $this.trigger('hint',[error.reason, true]);
        } else {
            $this.trigger('hint','Done.');
            $dialog.dialog('close');
        }
    });
}
