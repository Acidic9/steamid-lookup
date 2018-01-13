import { Search } from './search';

/**
 * Entry point for program.
 * 
 * @class Startup
 */
class Startup {
	private static searchBoxElem: HTMLInputElement

	public static main(): number {
		this.searchBoxElem = <HTMLInputElement>document.getElementById('search-box');
		let search = new Search(this.searchBoxElem);

		(document.querySelector('.search-form') as HTMLFormElement).onsubmit = () => {
			search.execQuery(this.searchBoxElem.value, true);
			return false;
		}
		this.searchBoxElem.disabled = false;

		if (window.location.pathname !== '/') {
			let res = /\/\u\/(\d{17})$/g.exec(window.location.pathname);
			let uid = res && res.length >= 2 ? res[1] : null;
			if (uid === null) {
				window.history.pushState('SteamID Lookup', 'SteamID Lookup', '/');
			} else {
				this.searchBoxElem.style.animation = 'unset';
				this.searchBoxElem.style.opacity = '1 !important';
				search.execQuery(uid, true);
			}
		}

		return 0;
	}
}

Startup.main();