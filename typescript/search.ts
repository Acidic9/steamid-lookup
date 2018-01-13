declare var Clipboard: any;
declare var tippy: any;

declare global {
	interface HTMLInputElement {
		_tippy: any;
	}
}

/**
 * Handles search queries
 * 
 * @class Search
 */
export class Search {
	/**
	 * Duration to wait before searching after keyup has been fired
	 */
	static readonly KeyUpSearchDelay: number = 500;

	private searchTimeout: number = null;
	private xhReq: XMLHttpRequest = null;

	private userSteamIDElem: HTMLInputElement = null;
	private userSteamID64Elem: HTMLInputElement = null;
	private userSteamID32Elem: HTMLInputElement = null;
	private userSteamID3Elem: HTMLInputElement = null;

	constructor(private inputElem: HTMLInputElement) {
		this.xhReq = new XMLHttpRequest();
		this.xhReq.onerror = (ev: ErrorEvent) => { };

		inputElem.addEventListener('keyup', this.inputElemKeyUpEvent.bind(this));
		inputElem.addEventListener('focus', this.inputElemFocusEvent.bind(this));

		this.userSteamIDElem = document.getElementById('user-id').querySelector('input');
		tippy(this.userSteamIDElem, {
			trigger: 'manual',
			arrow: true,
			flip: false,
			size: 'small', // small, regular, large
		});
		new Clipboard(this.userSteamIDElem).on('success', this.onClipboardCopySuccess.bind(this.userSteamIDElem._tippy));

		this.userSteamID64Elem = document.getElementById('user-id64').querySelector('input');
		tippy(this.userSteamID64Elem, {
			trigger: 'manual',
			arrow: true,
			flip: false,
			size: 'small', // small, regular, large
		});
		new Clipboard(this.userSteamID64Elem).on('success', this.onClipboardCopySuccess.bind(this.userSteamID64Elem._tippy));

		this.userSteamID32Elem = document.getElementById('user-id32').querySelector('input');
		tippy(this.userSteamID32Elem, {
			trigger: 'manual',
			arrow: true,
			flip: false,
			size: 'small', // small, regular, large
		});
		new Clipboard(this.userSteamID32Elem).on('success', this.onClipboardCopySuccess.bind(this.userSteamID32Elem._tippy));

		this.userSteamID3Elem = document.getElementById('user-id3').querySelector('input');
		tippy(this.userSteamID3Elem, {
			trigger: 'manual',
			arrow: true,
			flip: false,
			size: 'small', // small, regular, large
		});
		new Clipboard(this.userSteamID3Elem).on('success', this.onClipboardCopySuccess.bind(this.userSteamID3Elem._tippy));
	}

	private inputElemKeyUpEvent(ev: KeyboardEvent): any {
		if (ev.keyCode === 13)
			return;

		clearTimeout(this.searchTimeout);

		let inputElemValue = this.inputElem.value;
		if (inputElemValue == '')
			return;

		this.searchTimeout = setTimeout(() => { this.execQuery(inputElemValue, true); }, Search.KeyUpSearchDelay);
	}

	private inputElemFocusEvent(ev: FocusEvent): any {
		if (hasClass(this.inputElem, 'smaller'))
			this.inputElem.select();
	}

	private onClipboardCopySuccess(ev: any): void {
		ev.clearSelection();
		setTimeout(() => {
			var elemTippy: any = this;
			elemTippy.show();
			setTimeout(() => {
				elemTippy.hide();
			}, 1500);
		}, 1);
	}

	public execQuery(query: string, async: boolean = false): boolean {
		addClass('logo', 'slide-to-top-hide');
		addClass('search-box', 'smaller');
		hide('user-results');
		hide('not-found-results');
		show('loading-results');

		let foundUser = null;

		this.xhReq.open('GET', '/api/search?query=' + query, async);
		this.xhReq.onloadend = (ev: Event) => {
			if (this.xhReq.status !== 200)
				return;

			this.inputElem.blur();

			let jsonResp = <QueryResp>JSON.parse(this.xhReq.responseText);
			if (jsonResp) {
				if (!jsonResp.success) {
					foundUser = false;
					hide('loading-results');
					show('not-found-results');
					this.inputElem.focus();
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

				let userLevel = document.getElementById('steam-level');
				let userLevelFontSize;
				if (jsonResp.playerSummary.steamLevel < 100)
					userLevelFontSize = 16;
				else if (jsonResp.playerSummary.steamLevel < 1000)
					userLevelFontSize = 14;
				else
					userLevelFontSize = 11;
				userLevel.style.fontSize = userLevelFontSize + 'px';
				userLevel.innerText = jsonResp.playerSummary.steamLevel.toString();
				(document.getElementById('user-pic') as HTMLImageElement).src = jsonResp.playerSummary.avatarfull;

				let userNameElem = document.getElementById('user-name');
				userNameElem.innerText = jsonResp.playerSummary.personaname;

				let userURLElem = document.getElementById('user-url').querySelector('a');
				userURLElem.innerText = jsonResp.playerSummary.profileurl;
				userURLElem.setAttribute('href', jsonResp.playerSummary.profileurl);

				this.userSteamIDElem.value = jsonResp.playerSummary.ids.id;
				this.userSteamID64Elem.value = jsonResp.playerSummary.ids.id64.toString();
				this.userSteamID32Elem.value = jsonResp.playerSummary.ids.id32.toString();
				this.userSteamID3Elem.value = jsonResp.playerSummary.ids.id3;

				hide('loading-results');
				show('user-results');
				addClass('user-results', 'fade-in-slow');

				window.history.pushState('SteamID Lookup', 'SteamID Lookup', '/u/' + jsonResp.playerSummary.ids.id64);
				document.title = 'Steam ID Lookup | ' + jsonResp.playerSummary.personaname;
			}
		};
		this.xhReq.send(null);

		return foundUser;
	}
}

class QueryResp {
	success: string;
	playerSummary: {
		avatar: string;
		avatarfull: string;
		avatarmedium: string;
		communityvisibilitystate: number;
		lastlogoff: number;
		loccountrycode: string;
		personaname: string;
		personastate: number;
		personastateflags: number;
		primaryclanid: string;
		profilestate: number;
		profileurl: string;
		realname: string;
		steamid: string;
		timecreated: number;
		steamLevel: number;
		ids: {
			id: string;
			id64: number;
			id32: number;
			id3: string;
		};
	};
	resolvedVia: number;
}

enum ResolvedVia {
	FAILED,
	VANITY_URL,
	ID,
	ID3,
	ID32,
	ID64,
}

const addClass = (id: string, className: string): void => {
	let elem = document.getElementById(id);
	if (elem.classList)
		elem.classList.add(className);
	else
		elem.className += ' ' + className;
}

const removeClass = (id: string, className: string): void => {
	let elem = document.getElementById(id);
	if (elem.classList)
		elem.classList.remove(className);
	else
		elem.className = elem.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

const hasClass = (elem: HTMLElement, className: string): boolean => {
	if (elem.classList)
		return elem.classList.contains(className);

	return new RegExp('(^| )' + className + '( |$)', 'gi').test(elem.className);
}

const loopClass = (selectorClass: string, func: (elem: Element) => void): void => {
	let elems = document.getElementsByClassName(selectorClass);
	for (let i = 0; i < elems.length; ++i) {
		func(elems[i]);
	}
}

const hide = (id: string): void => {
	addClass(id, 'hidden');
}

const show = (id: string): void => {
	removeClass(id, 'hidden');
}