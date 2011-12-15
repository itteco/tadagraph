function() {
    var filter = getFilter();
    var enabled = true;
    if (filter.db.type && filter.db.name) {
        if (getFilter().db.type == "person") {
            enabled = true;
            
        } else {
            var space = API.filterSpace(getFilter());
            enabled = isActiveSpace(space);
        }
    }
    
    var items = [];
    var menus = API.getMenu(filter);
    if (menus) {
        menus.forEach(function(menu) {
            var selected = filter.view == menu.id || filter.view == "" && "default" in menu;
            var scope = menu.scope || "self";
            var space;
            switch (scope) {
                case "self": space = filter.db; break;
                case "type": space = {type: filter.db.type, name: ""}; break;
            }
            items.push({
                title: menu.title(),
                visible: (menu.visible === undefined || menu.visible) && (menu.visible !== "selected" || selected) && (enabled || menu.spaceStatus == "any"),
                selected: selected? "selected": "",
                url: getUrlByFilter({db: space, view: menu["default"]? "": menu.id}),
                sys_menu: menu.id.replace("#", "")
            });
        });
    }
    
    return {
        items: items
    }
}
