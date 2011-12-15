function() {
    var $info       = $('.member-info', this),
        $close      = $info.find('.close'),
        $content    = $info.find('.data .text'),
        $loader     = $info.find('.loader'),
        $connectButton = $info.find('a[rel="connect"]'),
        $item;
    
    var $this = $(this),
        $$this = $$(this);
    
    initContactConnect();
    
    var lastLoadedContact = null;
    $info.find('a[rel="message"]').click(function(event) {
        event.preventDefault();
        if (lastLoadedContact)
            $("#id_reply_form").trigger("showReplyDialog", [null, lastLoadedContact]);
    });
    
    function hideProgress() {
        $loader.hide();
        $content.show();
    }
    
    function showProgress() {
        $content.hide();
        $loader.show();
    }
    
    $('.avatar[data-id]:not(.account-of-myself)').live('click', function(event) {
        $item = $(this);
        info($item);

        event.preventDefault();
        event.stopPropagation();
    });
    
    $.pathbinder.onChange(function(path) {
       infoHide();
    });
    
    $close.click(function(event){
        infoHide();
        event.preventDefault();
    });
    
    function info($item) {
        
        var member = $item.data('id');
        
        $info.find('.avatar').attr('src', API.avatarUrl(member, 'a128'));
        
        showProgress();
            
        getMemberInfo(member, function(info) {
            lastLoadedContact = info;
            hideProgress();
            
            // toggle current
            if (($info.data('member') == member) && $info.is(':visible') && $item.data('active')) {
                infoHide();
                return;
            }
    
            // update data
            if ($info.data('member') != member) {
                infoUpdate(info);
                $info.data('member', member);
            }
        });

        // show
        infoShow($item);
        infoUpdatePosition($item);
    }
    
    function infoShow($item) {
        // init avatar
        $info.show();
        $item.attr('title', '');
        $item.data('active', true);
    }

    function infoHide() {
        if ($item) {
            $info.hide();
            if (lastLoadedContact)
                $item.attr('title', lastLoadedContact.nickname);
            $item.data('active', false);
            
            $item = null;
        }
    }

    function infoUpdatePosition($item) {

        var offset = $item.offset();
        $info.removeClass('left bottom');

        var left = offset.left + $item.width() + 3;
        var top  = offset.top + parseInt( $item.css('margin-top').replace(/[^-\d\.]/g, '') ) - 1;

        var overflowY = $(window).width() - left - $info.outerWidth();
        //var overflowX = top - $(window).scrollTop() + $info.outerHeight() - $(window).height();

        if (overflowY < 10) {
            left = offset.left - $info.outerWidth() - 3;
            $info.addClass('left');
        }

        /*
        if (overflowX > 0) {
            top = top - $item.height();
            $info.addClass('bottom');
        }
        */

        $info.css({
            top:  top,
            left: left
        });

    }
    
    function infoUpdate(info) {
        var fname = API.getFirstAttribute(info, "Full name");
        var intro = API.getFirstAttribute(info, "Intro");
        var email = API.getFirstAttribute(info, "Email");
        email = email && email.value || email;

        $info.find('.title').text(fname || info.name);
        $info.find('.info').html(intro || '');

        if (email) {
            $info.find('.email').show().html('<a href="mailto:' + email + '">' + email + '</a>');
        }
        else {
            $info.find('.email').hide();
        }
        
        $info.find('.sys-profile').attr('href', '#~/contact/@' + info.nickname + '/');
        $info.find('.sys-activity').attr('href', '#~/contact/@' + info.nickname + '/history/');
        
        if (info.categories.indexOf("following") == -1) {
            $connectButton.addClass("connect").text("Follow");
        } else {
            $connectButton.removeClass("connect").text("Unfollow");;
        }
        $connectButton.data("profile", info);
    }
    
    var _cache = {};
    function getMemberInfo(member, callback) {
        if (member in _cache) {
            callback(_cache[member]);
        } else {
            API.people.get(member, {custom_attibutes: true}, function(error, profile) {
                _cache[member] = profile;
                callback(profile);
            });
        }
    }
    
    function initContactConnect() {

        var member,
            $dialog         = $this.find('.tdialog.connect'),
            $button         = $connectButton,
            $save           = $dialog.find('.controls .button-submit'),
            $profile        = $dialog.find('.list.profile'),
            $blockConnect   = $dialog.find('.box.connect'),
            $blockUnconnect = $dialog.find('.box.unconnect'),
            $validator      = $dialog.find('.message'),
            contactId, profile;
    
    
    
        // add new - dialog
    
        $dialog.dialog({
            title:          'Follow',
            dialogClass:    'tdialog contact new',
            width:          600,
            height:         'auto',
            hide:           'fade',
            resizable:      false,
            autoOpen:       false
        });
    
    
    
        $button.click(function(event){
            
            profile = $(this).data("profile");
            member =  profile.nickname;
            contactId = profile.id;
    
            if (!member) {
                member = $('.twidget.plist.contact .twidget-header h2').text();
            }
    
            if ($(this).hasClass('connect')) {
                dialogOpenConnect();
            }
            else {
                dialogOpenUnconnect();
            }
            event.preventDefault();
        });
    
        function dialogOpenConnect() {
            $profile.hide();
            $blockConnect.show();
            $blockUnconnect.hide();
            $save.button('option', 'label', 'Follow');
            $dialog.find('.member-name').text(member);
            $dialog.dialog('option', 'title', "Follow " + member);
            $dialog.dialog('open');
        }
    
        function dialogOpenUnconnect() {
            $blockConnect.hide();
            $blockUnconnect.show();
            $save.button('option', 'label', 'Unfollow');
            $dialog.find('.member-name').text(member);
            $dialog.dialog('option', 'title', "Unfollow " + member);
            $dialog.dialog('open');
        }
    
    
        $save.button().click(function(event){
            event.preventDefault();
            
            $save.button('disable').addClass('ui-state-progress');
            $validator.hide();
            
            function stopProgress() {
                $save.button('enable').removeClass('ui-state-progress');
            }
            function showError(error) {
                $validator.show();
                $validator.text(error);
            }
            
            if ($blockConnect.is(":visible")) {
                API.people.contacts.create(API.username(), {
                    id: contactId
                }, function(error, _profile) {
                    stopProgress();
                    if (error) {
                        showError(error.reason);
                    } else {
                        profile.categories.push("following");
                        infoUpdate(profile);
                        $dialog.dialog('close');
                    }
                });
            } else {
                API.people.contacts.remove(API.username(), contactId, function(error, _profile) {
                    stopProgress();
                    if (error) {
                        showError(error.reason);
                    } else {
                        arrayRemove(profile.categories, "following");
                        infoUpdate(profile);
                        $dialog.dialog('close');
                    }
                });
            }
        });
    
    }
}