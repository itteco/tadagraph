function(page, match, widgets, filter) {
    var docId = match[1];
    
    var $status = $('#id_inline_form').hide();

    API.filterDB(filter).openDoc(docId, {
        success: function(doc) {
            widgets['notificationsFiltered'].trigger('setFilter', [{parent: doc}]);
            
            widgets['notificationsFiltered'].before($status.show());
            
            $.extend(filter, {
                parent: doc,
                view: 'flow'
            });
            
            setFilter(filter);
            API.setTitle(filter);
            
            $('.sys-page-header', page).trigger('setOptions', [{
                title: doc.body.split(' ').slice(0,5).join(' '),
                avatarUrl: API.avatarUrl(doc.created_by.id)
            }]);
        }
    });
}
