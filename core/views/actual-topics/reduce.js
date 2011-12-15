(function (keys, values) {
    var max = values[0];
    for(var i in values) {
        if (values[i] > max)
            max = values[i];
    }
    return max;
})
