/*
 * -- -- -- -- -- -- -- -- -- - API -- -- -- -- -- -- -- -- --
 */
if (!window.API){
	window.API ={};
}

// gets API root $object
API.root = function($to, what){
    return $(window);
};

// trigger API event
API.trigger = function(what,args){
   API.root().trigger(what, Array.isArray(args)? args : [args]);
};

// bind some {#fn} to {#eventType} API event
API.bind = function(eventType, fn){
   API.root().bind(eventType, fn);
};

// connects API events to target with keys mapping
// @usage API.connect(this,['ifSomeEventHappens->render'])
API.connect = function(source, target, events) {
    if (!events){
        events = target;
        target = source;
        source = API.root();
   }

    var $source = $(source);
    var $target = $(target);

    (Array.isArray(events)?events:[events]).forEach(function(ev) {
            var keys = ev.split('->');
            $source.bind(keys[0], function() {
                $target.trigger(keys[(keys.length>1)?1:0], Array.slice(arguments,1));
                return false;
            });
     });
};

API.connectVisible = function(source, target, events) {
    var $source = $(source);
    var $target = $(target);

    events.forEach(function(ev) {
        $source.bind(ev, function() {
            if ($target.is(":visible")) {
                var args = $.makeArray(arguments);
                args.shift();
                $target.trigger(ev, args);
            }
            return false;
        });
    });
};


// fires alert
API.alert = function(msg){

    API.trigger('api-alert',(typeof msg ==='string') ? {message:msg} : msg);

};

// default API error handler
API.error = function(error) {
    console.log("API.error", error);
    API.alert(error.reason || error.message || error);
};

// wraps {#cb} with error interceptor that invokes API.error() if any.
API.interceptError = function (cb){
    return function (err, data){
        if (err){
            API.error(err);
        } else {
            if (cb.length==1){
                cb(data);
            } else {
                cb(null, data);
            }
        }
   }
};

// performs remote API invocation with [url*], [opts], and [cb]
API.invoke = API.remote = (function (){

	var _error = function (req, textStatus, errorThrown, err) {
		console.log('API AJAX error: '+this.type+' '+this.url+" "+textStatus+": "+errorThrown, err);
		this.cb(err || {error:true, reason:textStatus+": "+errorThrown, details:'API AJAX error: '+this.type+' '+this.url+" "}, null, this);
    }

	var _complete = function (req) {
	    API.trigger("hideLoading");
    }

	var _success = function (data, textStatus, req) {
		//console.log('API AJAX _success: ', textStatus, 'HTTP Status:'+req.status, data);
        if (data.error) {
            _error.call(this, req, textStatus, 'HTTP Status:'+req.status, data);;
        } else {
            this.cb(null, data);
        }
    }

	var _cb = function (err, data) {
		console.log("API AJAX:", err,data);
    }

	var  OPTS = {
	        type: "GET",
	        dataType: 'json',
	        complete:_complete,
	    	success:_success,
	    	error: _error
	    };

	return function(url, opts, cb) {

	    if (!cb) {
	        cb = opts;
	        opts = null;
	    }

	    var options = Object.patch(Object.clone(OPTS),opts);

	    if (options.data) {
	    	options.contentType= "application/json";
	    	if (typeof options.data === 'object'){
	    		options.data = JSON.stringify(options.data);
	    	}
	    }

	    options.url	= API.path + url;

	    options.context = Object.clone(options);
	    options.context.cb = cb || _cb;
	    API.trigger("showLoading");

	    $.ajax(options);
	};

})();

