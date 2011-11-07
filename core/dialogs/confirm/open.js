function(e, $dialog, data) {
    e.stopPropagation();
    var creditCard = Object.attr(data,'profile.paymentProfile.payment.creditCard');
    var $this = $(this);

     // apply into UI
    //$dialog.find('#total-amount').html('$'+(data.transaction.totalAmount||totalAmount));
}
