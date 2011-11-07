'u s e strict';

/* -- Object, Array, Function  -- */

Function.NONE = (function () {

	var _none = Function.NONE = function(x) {return x;};
	
	var F=_none.constructor, P = F.prototype, _slice = Array.prototype.slice, _keys = Object.keys, _log = console.log;

	//overrides function with {#wrapper*}
	// NOTE: must use this.self to access actual {#this}
	// NOTE: can't override function with target binded
	//@usage console.log('override',(function(s){ return ++s;}).override( function(s) { return this._super.call(this.self, s+1); }).override( function(s) { return this._super.call(this.self, s+2); })(1));
	P.override = function(wrapper, target, extra) {
		var _super = this;
		return function(){
			return wrapper.apply({self: target || this, _super: _super, _extra: extra}, arguments);
		};
	};
	
	// scans {#arr} on {#ctx} with {#param}
	Function.prototype.scanArray = function(arr, ctx, param) {
		if (arr) {
            for (var i = 0, l = arr.length; i < l; this.call(ctx, arr[i++], i, param)) {}
 		}
		return ctx;
	};

	// search in {#arr} on {#ctx} with {#param}.
	// @return not empty result or {#noValue} if none found.
	Function.prototype.searchArray = function(arr, ctx, param, noValue) {
		if (arr) {
			for (var i = 0, l = arr.length, r; i < l; ) {
				if (r = this.call(ctx, arr[i++], i, param)) return r;
			}
		}
		return noValue;
	};

	// finds item of {#arr} with {#key*} attribute equals {#val}; or null in none found
	Array.findByAttr = function(arr, val, key) {
		if (arr) {
			for (var i = 0, l = arr.length; i < l; i++) {
				if (arr[i][key]===val) {
					return arr[i];
				}
			}
		}
		return null;
	};

	// patches {#arr} with {#outer} items.
	Array.patch = (function(_f) {
		return function(arr, outer) {
			if (arr) {
				_f.scanArray(outer, arr);
			}
			return  arr;
		};
	})( function (v) {if (!(this.indexOf(v)+1)) {this.push(v);}} );

	//@return {#pos=0} item of {#arr} or null.
	Array.item = function(arr, pos) {
		if (!pos) {pos=0;};
		return (arr && arr.length && arr.length>pos) ? arr[pos<0?(arr.length+pos):pos] : null;
	};

	//@return slice of {#arr} or empty array.
	Array.slice = function(arr, pos, end) {
		if (!pos) {pos=0;};
		return (arr && arr.length && arr.length>pos) ? _slice.call(arr, pos, end) : [];
	};


	// scans {#obj*} keys on {#ctx} with {#param}
	Function.prototype.scanObject = function(obj, ctx, param) {
		if (obj) {
			for ( var i = 0, keys = _keys(obj), l = keys.length, k; i < l; this.call(ctx, k = keys[i++], obj[k], param)) {}
		}
		return ctx;
	};

	//patches {#obj*} with key/values of {#extra}.
	var _patch = Object.patch =  function(obj, extra) {
		if (obj && extra) {
			for ( var i = 0, keys = _keys(extra), l = keys.length, k; i < l; obj[k = keys[i++]] = extra[k]) {}
		}
		return obj;
	};

	//@return {#obj} attribute by {#keys} in deep.
	// @usage 	console.log( Object.attr({a:{b:{c:'c'}}},'a.b.c'));
	var _attr = Object.attr =  function(obj, keys) {
		if (typeof keys ==='string'){
			keys = keys.split('.');
		}
		var r = null;
		if (obj) {
			for ( var i = 0, l = keys.length, v; i < l; i++) {
				if (!(v = obj[keys[i]])) {
					return null;
				}
				r = obj = v;
			}
		}
		return r;
	};

	//invokes "{#key}"-named method or {#def} on {#obj} with rest of arguments.
	Object.invoke = function(obj, key, def/*, args...*/) {
		var fn = obj && obj[key] || def;
		return  fn && fn.apply(obj, _slice.call(arguments,3)) || null;
	};

	// clones {#obj*}.
	Object.clone =  function(obj) {
		return _patch(new (obj.constructor || Object)(), obj);
	};

	// translates {#obj*} into new one according {#meta*}.
	Object.translate =  (function(_f) {
		return function(obj, meta) {
			var r = {};
			if (obj) {
				_f.scanObject(meta, obj, r);
			}
			return  r;
		};
	})( function (n,v,r) {r[n] = _attr(this,v||n);} );

	//@return object evaluated from {#s*}
	Object.parse = function(s) {
		try {
			return (new Function("return " + s))();
		} catch (e) {
		}
		return null;
	};

	return _none;

})();


/* -- mustashe utils -- */

//@return {items:{#arr}} for non empty {#arr} or null.
// Helpful for mustashe
Array.wrapItems = function(arr,key) {
    var r = null;
    if (arr && arr.length) {
        r = {};
        r[key||'items'] = arr;
    }
    return  r;
};
// applies Array.wrapItems() for each of {#attrs} of {#obj}
// Helpful for mustashe
Object.wrapItemsOfAttrs = (function() {
    var _f = function (e) {  this[e] = Array.wrapItems(this[e]);}

    return function(obj, attrs) {
        if (obj){
            _f.scanArray(attrs,obj);
        }
        return obj;
    };
})();


/* -- String -- */

// returns capitalized {#s} or null
String.capitalize = function(s) {
	return s && s.length && (s.charAt(0).toUpperCase() + s.substring(1)) || null;
};

// returns prefix of {#s} before {#t} or null if none.
String.prefixOf = function(s, t, p) {
	return s && ((p = s.indexOf(t))+1) && s.substring(0, p) || null;
};




/* -- Date -- */

/*
 * This should be nice date formatter. Let's use it.
 *
 * Doc is here: http://jacwright.com/projects/javascript/date_format
 */
Date.prototype.format=function(format){var returnStr='';var replace=Date.replaceChars;for(var i=0;i<format.length;i++){var curChar=format.charAt(i);if(i-1>=0&&format.charAt(i-1)=="\\"){returnStr+=curChar;}else if(replace[curChar]){returnStr+=replace[curChar].call(this);}else if(curChar!="\\"){returnStr+=curChar;}}return returnStr;};Date.replaceChars={shortMonths:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],longMonths:['January','February','March','April','May','June','July','August','September','October','November','December'],shortDays:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],longDays:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],d:function(){return(this.getDate()<10?'0':'')+this.getDate();},D:function(){return Date.replaceChars.shortDays[this.getDay()];},j:function(){return this.getDate();},l:function(){return Date.replaceChars.longDays[this.getDay()];},N:function(){return this.getDay()+1;},S:function(){return(this.getDate()%10==1&&this.getDate()!=11?'st':(this.getDate()%10==2&&this.getDate()!=12?'nd':(this.getDate()%10==3&&this.getDate()!=13?'rd':'th')));},w:function(){return this.getDay();},z:function(){var d=new Date(this.getFullYear(),0,1);return Math.ceil((this-d)/86400000);},W:function(){var d=new Date(this.getFullYear(),0,1);return Math.ceil((((this-d)/86400000)+d.getDay()+1)/7);},F:function(){return Date.replaceChars.longMonths[this.getMonth()];},m:function(){return(this.getMonth()<9?'0':'')+(this.getMonth()+1);},M:function(){return Date.replaceChars.shortMonths[this.getMonth()];},n:function(){return this.getMonth()+1;},t:function(){var d=new Date();return new Date(d.getFullYear(),d.getMonth(),0).getDate()},L:function(){var year=this.getFullYear();return(year%400==0||(year%100!=0&&year%4==0));},o:function(){var d=new Date(this.valueOf());d.setDate(d.getDate()-((this.getDay()+6)%7)+3);return d.getFullYear();},Y:function(){return this.getFullYear();},y:function(){return(''+this.getFullYear()).substr(2);},a:function(){return this.getHours()<12?'am':'pm';},A:function(){return this.getHours()<12?'AM':'PM';},B:function(){return Math.floor((((this.getUTCHours()+1)%24)+this.getUTCMinutes()/60+this.getUTCSeconds()/3600)*1000/24);},g:function(){return this.getHours()%12||12;},G:function(){return this.getHours();},h:function(){return((this.getHours()%12||12)<10?'0':'')+(this.getHours()%12||12);},H:function(){return(this.getHours()<10?'0':'')+this.getHours();},i:function(){return(this.getMinutes()<10?'0':'')+this.getMinutes();},s:function(){return(this.getSeconds()<10?'0':'')+this.getSeconds();},u:function(){var m=this.getMilliseconds();return(m<10?'00':(m<100?'0':''))+m;},e:function(){return"Not Yet Supported";},I:function(){return"Not Yet Supported";},O:function(){return(-this.getTimezoneOffset()<0?'-':'+')+(Math.abs(this.getTimezoneOffset()/60)<10?'0':'')+(Math.abs(this.getTimezoneOffset()/60))+'00';},P:function(){return(-this.getTimezoneOffset()<0?'-':'+')+(Math.abs(this.getTimezoneOffset()/60)<10?'0':'')+(Math.abs(this.getTimezoneOffset()/60))+':00';},T:function(){var m=this.getMonth();this.setMonth(0);var result=this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/,'$1');this.setMonth(m);return result;},Z:function(){return-this.getTimezoneOffset()*60;},c:function(){return this.format("Y-m-d\\TH:i:sP");},r:function(){return this.toString();},U:function(){return this.getTime()/1000;}};

// ====== Legacy

function arrayRemove(array, element) {
    if (!array)
        return [];

    var i = array.indexOf(element);
    if (i >= 0)
        return array.splice(i, 1);

    return array;
}

function runIfFun2(fun, args, thiz) {
	// if the field is a function, call it, bound to the widget
	var f = Object.parse(fun);
	// $.log(me, fun, args);
	if (typeof f == "function") {
            if (DEBUG) {
                return f.apply(thiz || this, args);
                
            } else {
		try {
			return f.apply(thiz || this, args);
		} catch (e) {
			// IF YOU SEE AN ERROR HERE IT HAPPENED WHEN WE TRIED TO RUN YOUR
			// FUNCTION
			$.log({
			    "message" : "Error in function",
			    "error" : e,
			    "src" : fun
			});
			throw e;
		}
            }
	}
}

function parseQueryString(str) {
	var vars = [];
	var arr = str.split('&');
	var pair;
	for (var i = 0; i < arr.length; i++) {
		pair = arr[i].split('=');
		vars.push(pair[0]);
		vars[pair[0]] = unescape(pair[1]);
	}
	return vars;
}
