import { Search } from './search';

/**
 * Entry point for program.
 * 
 * @class Startup
 */
class Startup {
	public static main(): number {
		const searchBoxElem = <HTMLInputElement>document.getElementById('search-box');
		const search = new Search(searchBoxElem);

		(document.querySelector('.search-form') as HTMLFormElement).onsubmit = () => {
			search.execQuery(searchBoxElem.value, true);
			return false;
		}
		searchBoxElem.disabled = false;

		if (window.location.pathname !== '/') {
			const res = /\/\u\/(\d{17})$/g.exec(window.location.pathname);
			const uid = res && res.length >= 2 ? res[1] : null;
			if (uid === null) {
				window.history.pushState('SteamID Lookup', 'SteamID Lookup', '/');
			} else {
				searchBoxElem.style.animation = 'unset';
				searchBoxElem.style.opacity = '1 !important';
				const searchBtnElem = document.getElementById('search-button');
				searchBtnElem.style.animation = 'unset';
				searchBtnElem.style.opacity = '0.4 !important';
				search.execQuery(uid, true);
			}
		}

		return 0;
	}
}

Startup.main();