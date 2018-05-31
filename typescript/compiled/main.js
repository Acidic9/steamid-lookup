"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var search_1 = require("./search");
var Startup = (function () {
    function Startup() {
    }
    Startup.main = function () {
        var searchBoxElem = document.getElementById('search-box');
        var search = new search_1.Search(searchBoxElem);
        document.body.addEventListener('load', function () {
            setTimeout(function () { return searchBoxElem.focus(); });
        });
        document.querySelector('.search-form').onsubmit = function () {
            search.execQuery(searchBoxElem.value, true);
            return false;
        };
        searchBoxElem.disabled = false;
        if (window.location.pathname !== '/') {
            var res = /\/\u\/(\d{17})$/g.exec(window.location.pathname);
            var uid = res && res.length >= 2 ? res[1] : null;
            if (uid === null) {
                window.history.pushState('SteamID Lookup', 'SteamID Lookup', '/');
            }
            else {
                searchBoxElem.style.animation = 'unset';
                searchBoxElem.style.opacity = '1 !important';
                var searchBtnElem = document.getElementById('search-button');
                searchBtnElem.style.animation = 'unset';
                searchBtnElem.style.opacity = '0.4 !important';
                search.execQuery(uid, true);
            }
        }
        return 0;
    };
    return Startup;
}());
Startup.main();
//# sourceMappingURL=main.js.map