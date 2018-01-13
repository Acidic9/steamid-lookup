"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Search = (function () {
    function Search(inputElem) {
        this.inputElem = inputElem;
        this.searchTimeout = null;
        this.xhReq = null;
        this.userSteamIDElem = null;
        this.userSteamID64Elem = null;
        this.userSteamID32Elem = null;
        this.userSteamID3Elem = null;
        this.xhReq = new XMLHttpRequest();
        this.xhReq.onerror = function (ev) { };
        inputElem.addEventListener('keyup', this.inputElemKeyUpEvent.bind(this));
        inputElem.addEventListener('focus', this.inputElemFocusEvent.bind(this));
        this.userSteamIDElem = document.getElementById('user-id').querySelector('input');
        tippy(this.userSteamIDElem, {
            trigger: 'manual',
            arrow: true,
            flip: false,
            size: 'small',
        });
        new Clipboard(this.userSteamIDElem).on('success', this.onClipboardCopySuccess.bind(this.userSteamIDElem._tippy));
        this.userSteamID64Elem = document.getElementById('user-id64').querySelector('input');
        tippy(this.userSteamID64Elem, {
            trigger: 'manual',
            arrow: true,
            flip: false,
            size: 'small',
        });
        new Clipboard(this.userSteamID64Elem).on('success', this.onClipboardCopySuccess.bind(this.userSteamID64Elem._tippy));
        this.userSteamID32Elem = document.getElementById('user-id32').querySelector('input');
        tippy(this.userSteamID32Elem, {
            trigger: 'manual',
            arrow: true,
            flip: false,
            size: 'small',
        });
        new Clipboard(this.userSteamID32Elem).on('success', this.onClipboardCopySuccess.bind(this.userSteamID32Elem._tippy));
        this.userSteamID3Elem = document.getElementById('user-id3').querySelector('input');
        tippy(this.userSteamID3Elem, {
            trigger: 'manual',
            arrow: true,
            flip: false,
            size: 'small',
        });
        new Clipboard(this.userSteamID3Elem).on('success', this.onClipboardCopySuccess.bind(this.userSteamID3Elem._tippy));
    }
    Search.prototype.inputElemKeyUpEvent = function (ev) {
        var _this = this;
        if (ev.keyCode === 13)
            return;
        clearTimeout(this.searchTimeout);
        var inputElemValue = this.inputElem.value;
        if (inputElemValue == '')
            return;
        this.searchTimeout = setTimeout(function () { _this.execQuery(inputElemValue, true); }, Search.KeyUpSearchDelay);
    };
    Search.prototype.inputElemFocusEvent = function (ev) {
        if (hasClass(this.inputElem, 'smaller'))
            this.inputElem.select();
    };
    Search.prototype.onClipboardCopySuccess = function (ev) {
        var _this = this;
        ev.clearSelection();
        setTimeout(function () {
            var elemTippy = _this;
            elemTippy.show();
            setTimeout(function () {
                elemTippy.hide();
            }, 1500);
        }, 1);
    };
    Search.prototype.execQuery = function (query, async) {
        var _this = this;
        if (async === void 0) { async = false; }
        addClass('logo', 'slide-to-top-hide');
        addClass('search-box', 'smaller');
        hide('user-results');
        hide('not-found-results');
        show('loading-results');
        var foundUser = null;
        this.xhReq.open('GET', '/api/search?query=' + query, async);
        this.xhReq.onloadend = function (ev) {
            if (_this.xhReq.status !== 200)
                return;
            _this.inputElem.blur();
            var jsonResp = JSON.parse(_this.xhReq.responseText);
            if (jsonResp) {
                if (!jsonResp.success) {
                    foundUser = false;
                    hide('loading-results');
                    show('not-found-results');
                    _this.inputElem.focus();
                    window.history.pushState('SteamID Lookup', 'SteamID Lookup', '/');
                    document.title = 'Steam ID Lookup';
                    return;
                }
                foundUser = true;
                switch (jsonResp.resolvedVia) {
                    case ResolvedVia.VANITY_URL:
                        document.getElementById('resolved-via').innerText = 'Vanity URL';
                        break;
                    case ResolvedVia.ID:
                        document.getElementById('resolved-via').innerText = 'Steam ID';
                        break;
                    case ResolvedVia.ID3:
                        document.getElementById('resolved-via').innerText = 'Steam ID 3';
                        break;
                    case ResolvedVia.ID32:
                        document.getElementById('resolved-via').innerText = 'Steam ID 32';
                        break;
                    case ResolvedVia.ID64:
                        document.getElementById('resolved-via').innerText = 'Steam ID 64';
                        break;
                }
                if (jsonResp.resolvedVia > 0)
                    addClass('search-box-meta', 'fade-in');
                switch (jsonResp.playerSummary.personastate) {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                        addClass('user-pic-container', 'state-online');
                        break;
                    default:
                        break;
                }
                var userLevel = document.getElementById('steam-level');
                var userLevelFontSize = void 0;
                if (jsonResp.playerSummary.steamLevel < 100)
                    userLevelFontSize = 16;
                else if (jsonResp.playerSummary.steamLevel < 1000)
                    userLevelFontSize = 14;
                else
                    userLevelFontSize = 11;
                userLevel.style.fontSize = userLevelFontSize + 'px';
                userLevel.innerText = jsonResp.playerSummary.steamLevel.toString();
                document.getElementById('user-pic').src = jsonResp.playerSummary.avatarfull;
                var userNameElem = document.getElementById('user-name');
                userNameElem.innerText = jsonResp.playerSummary.personaname;
                var userURLElem = document.getElementById('user-url').querySelector('a');
                userURLElem.innerText = jsonResp.playerSummary.profileurl;
                userURLElem.setAttribute('href', jsonResp.playerSummary.profileurl);
                _this.userSteamIDElem.value = jsonResp.playerSummary.ids.id;
                _this.userSteamID64Elem.value = jsonResp.playerSummary.ids.id64.toString();
                _this.userSteamID32Elem.value = jsonResp.playerSummary.ids.id32.toString();
                _this.userSteamID3Elem.value = jsonResp.playerSummary.ids.id3;
                hide('loading-results');
                show('user-results');
                addClass('user-results', 'fade-in-slow');
                window.history.pushState('SteamID Lookup', 'SteamID Lookup', '/u/' + jsonResp.playerSummary.ids.id64);
                document.title = 'Steam ID Lookup | ' + jsonResp.playerSummary.personaname;
            }
        };
        this.xhReq.send(null);
        return foundUser;
    };
    Search.KeyUpSearchDelay = 500;
    return Search;
}());
exports.Search = Search;
var QueryResp = (function () {
    function QueryResp() {
    }
    return QueryResp;
}());
var ResolvedVia;
(function (ResolvedVia) {
    ResolvedVia[ResolvedVia["FAILED"] = 0] = "FAILED";
    ResolvedVia[ResolvedVia["VANITY_URL"] = 1] = "VANITY_URL";
    ResolvedVia[ResolvedVia["ID"] = 2] = "ID";
    ResolvedVia[ResolvedVia["ID3"] = 3] = "ID3";
    ResolvedVia[ResolvedVia["ID32"] = 4] = "ID32";
    ResolvedVia[ResolvedVia["ID64"] = 5] = "ID64";
})(ResolvedVia || (ResolvedVia = {}));
var addClass = function (id, className) {
    var elem = document.getElementById(id);
    if (elem.classList)
        elem.classList.add(className);
    else
        elem.className += ' ' + className;
};
var removeClass = function (id, className) {
    var elem = document.getElementById(id);
    if (elem.classList)
        elem.classList.remove(className);
    else
        elem.className = elem.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
};
var hasClass = function (elem, className) {
    if (elem.classList)
        return elem.classList.contains(className);
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(elem.className);
};
var loopClass = function (selectorClass, func) {
    var elems = document.getElementsByClassName(selectorClass);
    for (var i = 0; i < elems.length; ++i) {
        func(elems[i]);
    }
};
var hide = function (id) {
    addClass(id, 'hidden');
};
var show = function (id) {
    removeClass(id, 'hidden');
};
//# sourceMappingURL=search.js.map