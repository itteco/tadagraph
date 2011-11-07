function(doc, req) {  
    if (doc.attachments) {
        var mustache = require('vendor/couchapp/lib/mustache');
        var images = doc.attachments.filter(function(attachment) {
            return attachment.fileType.match("image");
        });
    
        return mustache.to_html(this.templates.attachment, {
            title: images[0] && images[0].name,
            images: images
        });
    }
}
