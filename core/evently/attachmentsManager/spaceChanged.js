function(e, form, space, oldSpace) {
    e.stopPropagation();
    
    if (oldSpace && space.name == oldSpace.name && space.type == oldSpace.type)
        return;

    var $$form = $$(form);
    var tasks = $$form.attachmentTasks;
    if (tasks && tasks.length > 0) {
        if (oldSpace && oldSpace.name) {
            var oldSpaceDB = API.filterDB({db: oldSpace}); // TODO: hide db
            for (var i = 0; i < tasks.length; i++) {
                oldSpaceDB.removeDoc(tasks[i].doc);
                tasks[i].doc = null;
            }
        }

        if (space && space.name) {
            $$form.attachmentTasks = [];
            $$form.attachmentUploader.reset();
            for (var i = 0; i < tasks.length; i++) {
                $$form.attachmentUploader.uploadFile(tasks[i].file);
            }
        }
    }
}
