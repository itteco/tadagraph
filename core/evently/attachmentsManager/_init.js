function(e, form, uploader, uploaderList) {
    e.stopPropagation();
    var saveDoc = function(DB, doc) {
        var error = false;
        $.ajax({
            async: false,
            type: "POST",
            url: DB.uri,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(doc),
            success: function(resp, status, req) {
                if (req.status == 201) {
                    doc._id = resp.id;
                    doc._rev = resp.rev;

                } else {
                    error = true;
                }
            },
            error: function() {
                error = true;
            }
        });

        return error? false: doc;
    };
    
    var $$form = $$(form);
    
    $$form.attachmentUploader = new qq.FileUploader({
        element:     uploader,
        elementList: uploaderList,
        initTask: function(task) {
            if (! $$form.attachmentTasks)
                $$form.attachmentTasks = [];

            task.id = $$form.attachmentTasks.push(task) - 1;
            
            var DB = API.filterDB({db: $$form.currentDB}); // TODO: hide db
            var profile = API.profile();

            var attachmentDoc = {
                db: { // TODO: hide db
                    name: DB.name,
                    type: DB.type
                },
                type: "attachment",
                ver: 1,
                created_at: new Date(),
                created_by: {
                    id: profile.id,
                    nickname: profile.nickname
                },
                name: task.name,
                fileType: task.type
            };
            if (saveDoc(DB, attachmentDoc)) {
                task.method = "PUT";
                task.action = DB.uri + attachmentDoc._id + "/" + task.name + "?rev=" + attachmentDoc._rev;
                task.doc = attachmentDoc;
                return true;
            }
            return false;
        },
        removeTask: function(taskId) {
            if ($$form.attachmentTasks) {
                var tasks =  $$form.attachmentTasks;
                var i = 0;
                while(i < tasks.length && tasks[i].id != taskId) {
                    i++;
                }
                
                if (i < tasks.length) {
                    var task = tasks[i];
                    var DB = API.filterDB({parent: task.doc});
                    DB.removeDoc(task.doc);
                    tasks.splice(i, 1);
                }
            }
        },
        onComplete: function(task, response) {
            if (response.ok) {
                task.doc._rev = response.rev;
            } else {
                var DB = API.filterDB({db: $$form.currentDB});
                DB.removeDoc(task.doc);
            }
        }
    });
}
