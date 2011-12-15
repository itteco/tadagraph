function mainInit() {

    $(window).trigger('asyncload');

//    $.evently.log = DEBUG;
	//TODO check if this reasonable.
	function checkScripts() {
		return (typeof jQuery != 'undefined' &&
	     typeof jQuery().dialog != 'undefined' &&
	     typeof jQuery().placeholder != 'undefined');
	}


	// wait until ready
	 if (!checkScripts()) {
	     setTimeout(mainInit, 100);
	     return;
	 }

	(function initTextCrop() {
		    textCrop();

		    // Bind only one time
		    if (!initTextCrop.initialized) return;
		    initTextCrop.initialized = true;

		    $(window).bind('resize', function() {
		        textCrop();
		    });
	})();

    if (navigator.language) {
        var language_parts = navigator.language.split("-");
        if (language_parts) {
            LANGUAGE = language_parts[0];
        }
    }
    window.onerror = function(e) {
        // Save log about error.
        $.log("error: " + e);
        API.error(e);
    };

    var appLoad = function(resp) {
//        if (!appLoad.resp) {
//          appLoad.resp = resp;
//          return;
//        }
//        resp = appLoad.resp;

        var preloadedDdocs = [],
            rows = resp.rows,
            waiting = rows.length;

        var commonDB = API.commonDB();

        rows.forEach(function(row) {
            preloadedDdocs[row.id] = row.doc;
            var design = row.id.replace("_design/", "");
            $.couch.app(function(app) {
                APPS[design] = app;
                $.extend(API.partials, app.ddoc.partials);
                if (--waiting === 0) {
                    API.username(function() {
                        API.profile();

                        // DB storage disabled.
                        //API.userStorage.init(done);
                        done();
                    });
                }
            }, {
                couchdb: commonDB,
                db: commonDB.name,
                preloadedDdocs: preloadedDdocs,
                design: design
            });
        });

        function done() {
            prepareDocWidgets();

            var $inlineForm = $("#id_inline_form");
            var $replyForm = $("#id_reply_form");
            var $pages = $("#pages");
            var $changesManager = $("#id_changes_manager");

            $.evently.connect($pages, $changesManager, ["doc-changes"]);

            // Default widgets for now.
            var core = APPS["core"];
            $("#id_thread_preview").evently("threadPreview", core);
            $("#id_tada_menu").evently("tadaMenu", core);
            $("#id_follow_manager").evently("followManager", core);
            $changesManager.evently("docChangesManager", core);
            $inlineForm.evently("basicForm", core, [{inline: true}]);

            $pages.evently("pageManager", core);
            $("#id_tada_edit").evently("itemEditForm", core);
            $replyForm.evently("replyDialog", core);

            forEachApp(function(app, name) {
                if (app.ddoc.init) {
                    try {
                        runIfFun2(app.ddoc.init, [function() {
                        }], app);

                    } catch(e) {
                        $.log("Unable to init app", name, e, app.ddoc.init);
                        throw e;
                    }
                }
            });

            API.trigger('apps-loaded');

            API.bind("afterPageShown", function(e, page, pageWidgetId){
                $('.subnav .account-menu').toggleClass('selected', pageWidgetId === 'teamfm-manage/pageAccount');

            })
        }
    };

    if (window._DESIGN_XHR && _DESIGN_XHR.docs) {
        appLoad(_DESIGN_XHR.docs);

    } else {
        window.$onDocLoad = appLoad;
    }
}
