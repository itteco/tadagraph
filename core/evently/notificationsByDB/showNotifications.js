function(e, statuses) {
  statuses.forEach(function(status) {    
    $('#notifierPopup').trigger('showNotifications', [[{
      id: status._id,
      type: 'status',
      data: status,
      ref: status
    }]]);
  });
}
