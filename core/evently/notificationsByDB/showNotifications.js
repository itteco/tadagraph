function(e, notifications) {
  notifications.forEach(function(notification) {    
    $('#notifierPopup').trigger('showNotifications', [[{
      id: notification._id,
      type: 'status',
      data: notification,
      ref: notification
    }]]);
  });
}
