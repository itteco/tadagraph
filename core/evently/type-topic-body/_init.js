function (e, doc, options) {
    e.stopPropagation();
    
    // Redirects to topic log view.
    document.location.href = getUrlByFilter({topic: doc.topic, tag: "note"});
}