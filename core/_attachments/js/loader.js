
load_scripts([
    'css/tadagraph.loader.min.css',
    'css/tadagraph.core.min.css',
    'css/tadagraph.apps.min.css',
    {
        first: "js/jquery.couch.js",
        then: [
        "vendor/couchapp/jquery.couch.app.js",
        "vendor/couchapp/jquery.couch.app.util.js"
        ]
    },
    "js/uuid.js",
    {
        first: "js/static.js",
        then: [
        function(callback) {
            var _DESIGN_XHR = window._DESIGN_XHR ={};

            if (typeof DESIGNS === 'object') {
                onload(DESIGNS);

                callback();
                return;
            }

            function onload(data) {
                _DESIGN_XHR.docs = data;
                
                totalDdocs = 1;
                Object.invoke(window, 'update_progress');
                
                window.$onDocLoad && window.$onDocLoad(data);
                delete window.$onDocLoad;
            }

            var totalSize = 435000;

            window._DESIGN_XHR = _DESIGN_XHR = $.ajax({
                type: 'GET',
                url: API.commonDBURI() + '_all_docs',
                data: {
                    startkey: '"_design"',
                    endkey: '"_design0"',
                    include_docs: true
                },
                dataType: 'json',
                success: onload
            });
            if (!NOLOADER && ($.browser.webkit || $.browser.firefox)) {
                _DESIGN_XHR.onprogress = function(e) {
                    totalDdocs = Math.min(1, e.position / totalSize);
                    Object.invoke(window, 'update_progress');
                };
                _DESIGN_XHR.onload = function(e) {
                    totalDdocs = 1;
                    Object.invoke(window, 'update_progress');
                };
            }
            callback();
        }
        ]
    },
    "vendor/couchapp/jquery.mustache.js",
    "vendor/couchapp/jquery.evently.js",
    "vendor/couchapp/jquery.pathbinder.js",

    // Smile.

    "js/libs.min.js",
    "js/notes-libs.min.js",

    "fileuploader/fileuploader.js",

    "js/jquery.jscrollpane/jquery.mousewheel.js",
    "js/jquery.jscrollpane/mwheelIntent.js",
    "js/jquery.jscrollpane/jquery.jscrollpane.min.js",

    "js/jquery.fancybox/jquery.easing-1.3.pack.js",
    "js/jquery.highlight-3.yui.js",

    // Tadagraph core.

    "js/jquery.reject.min.js",
    "js/jquery.timeago.js",

    "js/ajaxupload.js",
    "js/jquery.Jcrop.js",
    
     "js/api-ui.js",
   
    
    "js/main.js",
    "js/common.js"
], function onFullLoad() { mainInit(); });
