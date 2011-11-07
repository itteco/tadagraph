function(e, form) {
    var $$form = $$(form);
    
    var db = $$form.currentDB;
    var tasks = $$form.attachmentTasks;
    if (db.name && tasks) {
        var DB = API.filterDB({db: db});
        for (var i = 0; i < tasks.length; i++) {
            DB.removeDoc(tasks[i].doc);
        }
    }

    $$form.attachmentTasks = [];
    $$form.attachmentUploader.reset();
}
