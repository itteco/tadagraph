function(e, match) {
    var $this = $(this);
    
    var app = $$(this).app;
    
    var $body = $(document.body);
    var $spaceMenu = $(".app-menu", this);
    var $statusForm = $(".status-form-widget", this),
        $$statusForm = $$($statusForm);
    var $tagsSystem = $(".twidget.tags.system .twidget-body", this);
    var $tagsUser = $(".twidget.tags.user", this);
    var $topicsList = $(".topics-list", this);

    $this.bind('show', function() {
      if ($$statusForm.reloadOnShow) {
        $$statusForm.realoadOnShow = false;
        $statusForm.trigger('render');
      }
    });
    
    $.evently.connect($body, $spaceMenu, ["showLoading", "hideLoading"]);
    
    $.evently.connect($body, $(".twidget.filter", this), ["profilesLoaded"]);
    
    $.evently.connect($("#notifications_count_widget"), $(".topics"), ["setNotificationsCount"]);
    
    $.evently.connect($body, $statusForm, ['profileLoaded']);
    API.connectVisible($body, $tagsSystem, ["setFilter"]);
    API.connectVisible($body, $tagsUser, ["setFilter"]);
    $.evently.connect($body, $topicsList, ["setFilter"]);
    
    $.evently.connect($("#id_topics"), $topicsList, ["topicsLoaded"]);

    $(".twidget.filter", this).evently("filterPanel", app);
    $spaceMenu.evently("space-menu", app);
    $statusForm.evently("basicForm", app);
    $tagsSystem.evently("tags-system", app);
    $tagsUser.evently("tags-user", app);
    $topicsList.evently("topics-recent", app);

    function initScrollingMenu() {
        var $window = $(window);
        var $left = $this.find('.menu .nav-wrapper');
        var $right = $this.find('.sidebar .nav-wrapper', $this);

        var navs = [$left, $right];

        if ($left.size() == 0) {
            return;
        }

        var offsetY = $left.offset().top - 20;

        function setPosition() {
            $(navs).each(function(){
                var $item = $(this);
                if (($window.scrollTop() > offsetY) && ($window.height() > $item.height())) {
                    $item.addClass('fixed');
                }
                else {
                    $item.removeClass('fixed');
                }
            });
        }

        $window.scroll(function() {
            setPosition();
        });

        $window.resize(function() {
            setPosition();
        });
    }
    
    initScrollingMenu();
}
