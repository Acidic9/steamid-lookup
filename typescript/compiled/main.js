"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var search_1 = require("./search");
var Startup = (function () {
    function Startup() {
    }
    Startup.main = function () {
        var _this = this;
        this.searchBoxElem = document.getElementById('search-box');
        var search = new search_1.Search(this.searchBoxElem);
        document.querySelector('.search-form').onsubmit = function () {
            search.execQuery(_this.searchBoxElem.value, true);
            return false;
        };
        this.searchBoxElem.disabled = false;
        if (window.location.pathname !== '/') {
            var res = /\/\u\/(\d{17})$/g.exec(window.location.pathname);
            var uid = res && res.length >= 2 ? res[1] : null;
            if (uid === null) {
                window.history.pushState('SteamID Lookup', 'SteamID Lookup', '/');
            }
            else {
                this.searchBoxElem.style.animation = 'unset';
                this.searchBoxElem.style.opacity = '1 !important';
                search.execQuery(uid, true);
            }
        }
        return 0;
    };
    return Startup;
}());
Startup.main();
//# sourceMappingURL=main.js.map