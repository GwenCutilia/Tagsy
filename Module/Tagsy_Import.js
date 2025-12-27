// if (window.__TAGSY_IMPORTED__) {
// 	return;
// }
// window.__TAGSY_IMPORTED__ = true;

// class ResourceLoader {
// 	static resourcesAdded = 0;
// 	static resourcesTotal = 0;

// 	constructor() {}

// 	static getRealUrl() {
// 		try {
// 			return unsafeWindow.location.href;
// 		} catch (e) {
// 			try {
// 				return document.currentScript.ownerDocument.URL;
// 			} catch (err) {
// 				return window.location.href;
// 			}
// 		}
// 	}

// 	static loadJsAsync(jsUrl) {
// 		return new Promise((resolve, reject) => {
// 			const script = document.createElement("script");
// 			script.src = jsUrl + `?v=${Date.now()}`;
// 			script.dataset.dynamic = "true";
// 			script.onload = () => resolve(1);
// 			script.onerror = () => reject(new Error(`Failed to load JS: ${jsUrl}`));
// 			document.head.appendChild(script);
// 		});
// 	}

// 	static loadCssAsync(cssUrl) {
// 		return new Promise((resolve, reject) => {
// 			const link = document.createElement("link");
// 			link.rel = "stylesheet";
// 			link.href = cssUrl + `?v=${Date.now()}`;
// 			link.onload = () => resolve(1);
// 			link.onerror = () => reject(new Error(`Failed to load CSS: ${cssUrl}`));
// 			document.head.appendChild(link);
// 		});
// 	}

// 	static async loadResourceAsync(url) {
// 		if (url.endsWith(".css")) {
// 			try {
// 				return await ResourceLoader.loadCssAsync(url);
// 			} catch (err) {
// 				console.error(err);
// 				return 0;
// 			}
// 		}

// 		if (url.endsWith(".js")) {
// 			try {
// 				return await ResourceLoader.loadJsAsync(url);
// 			} catch (err) {
// 				console.error(err);
// 				return 0;
// 			}
// 		}

// 		console.warn("Unknown resource type:", url);
// 		return 0;
// 	}

// 	static async loadResourcesParallel(resources) {
// 		const results = await Promise.all(
// 			resources.map(url => ResourceLoader.loadResourceAsync(url))
// 		);
// 		return results.reduce((sum, v) => sum + v, 0);
// 	}

// 	static async loadResourcesByGroups(groups) {
// 		let totalSuccess = 0;
// 		for (const group of groups) {
// 			totalSuccess += await ResourceLoader.loadResourcesParallel(group);
// 		}
// 		return totalSuccess;
// 	}

// 	static async testUrl(url) {
// 		try {
// 			const response = await fetch(url, {
// 				method: "HEAD",
// 				cache: "no-store",
// 			});
// 			return response.ok;
// 		} catch (e) {
// 			return false;
// 		}
// 	}

// 	static async resolveBaseUrl() {
// 		const localBaseUrl = "http://127.0.0.1:5500/";
// 		const remoteBaseUrl = "https://weavefate.asia/";

// 		const testFile = localBaseUrl + "Source/Utils/Tool.js";
// 		const localAvailable = await ResourceLoader.testUrl(testFile);

// 		return localAvailable ? localBaseUrl : remoteBaseUrl;
// 	}

// 	static async loadAllResources() {
// 		const Url = await ResourceLoader.resolveBaseUrl();

// 		const resourceGroups = [
// 			[
// 				Url + "Source/Utils/Tool.js",
// 			],
// 			[
// 				Url + "Source/Core/Behavior.js",
// 				Url + "Source/Core/Global.js",
// 				Url + "Source/Core/HttpRequest.js",
// 				Url + "Source/Core/Route.js",
// 			],
// 			[
// 				Url + "Source/Global/QLabelGlobal.js",
// 				Url + "Source/Global/LoginGlobal.js",
// 				Url + "Source/Global/W2Global.js",
// 				Url + "Source/Global/LSGlobal.js",
// 				Url + "Source/Global/ApiboxGlobal.js",
// 				Url + "Source/Global/SystemGlobal.js",
// 				Url + "Source/Global/SettingGlobal.js",
// 				Url + "Source/Global/QLabelEngineGlobal.js",
// 				Url + "Source/Global/QLabelEngineEmbeddeGlobal.js",
// 			],
// 			[
// 				Url + "Source/Global/FrameworkGlobal.js",
// 			],
// 			[
// 				Url + "Source/Request/QLabelRequest.js",
// 				Url + "Source/Request/JsonBinRequest.js",
// 				Url + "Source/Request/W2Request.js",
// 				Url + "Source/Request/LSRequest.js",
// 				Url + "Source/Request/ApiboxRequest.js",
// 				Url + "Source/Request/QLabelEngineRequest.js",
// 			],
// 			[
// 				Url + "Source/Behavior/FrameworkBehavior.js", // 网站框架函数类
// 				Url + "Source/Behavior/SystemBehavior.js", // 系统函数类
// 			],
// 			[
// 				Url + "Source/Task/FrameworkTask.js",
// 			],
// 			[
// 				Url + "Source/Behavior/QLabelBehavior.js",
// 				Url + "Source/Behavior/LoginBehavior.js",
// 				Url + "Source/Behavior/W2Behavior.js",
// 				Url + "Source/Behavior/LSBehavior.js",
// 				Url + "Source/Behavior/SettingBehavior.js",
// 				Url + "Source/Behavior/QLabelEngineBehavior.js",
// 				Url + "Source/Behavior/QLabelEngineEmbeddeBehavior.js",
// 			],
// 			[
// 				Url + "Source/Page/FrameworkPage.js",
// 			],
// 			[
// 				Url + "Source/Page/QLabelPage.js",
// 				Url + "Source/Page/LoginPage.js",
// 				Url + "Source/Page/W2Page.js",
// 				Url + "Source/Page/LSPage.js",
// 				Url + "Source/Page/SettingPage.js",
// 				Url + "Source/Page/QLabelEnginePage.js",
// 			],
// 			[
// 				Url + "Module/Common/Tagsy_Core.js",
// 			],
// 		];

// 		ResourceLoader.resourcesTotal = resourceGroups.flat().length;
// 		ResourceLoader.resourcesAdded = await ResourceLoader.loadResourcesByGroups(resourceGroups);
// 	}
// }

class ResourceLoader {
	static resourcesAdded = 0;
	static resourcesTotal = 0;

	static ONLINE_BASE = "https://weavefate.asia/";
	static LOCAL_BASE = "http://127.0.0.1:5500/";

	static loadJsAsync(jsUrl) {
		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = jsUrl + `?v=${Date.now()}`;
			script.dataset.dynamic = "true";
			script.onload = () => resolve(1);
			script.onerror = () => reject(new Error("load js failed"));
			document.head.appendChild(script);
		});
	}

	static loadCssAsync(cssUrl) {
		return new Promise((resolve, reject) => {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = cssUrl + `?v=${Date.now()}`;
			link.dataset.dynamic = "true";
			link.onload = () => resolve(1);
			link.onerror = () => reject(new Error("load css failed"));
			document.head.appendChild(link);
		});
	}

	static async loadResourceAsync(url) {
		if (url.endsWith(".js")) {
			try {
				return await this.loadJsAsync(url);
			} catch {
				return 0;
			}
		}
		if (url.endsWith(".css")) {
			try {
				return await this.loadCssAsync(url);
			} catch {
				return 0;
			}
		}
		return 0;
	}

	static async loadResourcesParallel(list) {
		const r = await Promise.all(
			list.map(u => this.loadResourceAsync(u))
		);
		return r.reduce((a, b) => a + b, 0);
	}

	static async loadResourcesByGroups(groups) {
		let ok = 0;
		for (const g of groups) {
			ok += await this.loadResourcesParallel(g);
		}
		return ok;
	}

	static buildGroups(baseUrl) {
		return [
			[ baseUrl + "Source/Utils/Tool.js" ],
			[
				baseUrl + "Source/Core/Behavior.js",
				baseUrl + "Source/Core/Global.js",
				baseUrl + "Source/Core/HttpRequest.js",
				baseUrl + "Source/Core/Route.js",
			],
			[ baseUrl + "Module/Common/Tagsy_Core.js" ],
		];
	}

	static async loadAllResources(baseUrl) {
		const groups = this.buildGroups(baseUrl);
		this.resourcesTotal = groups.flat().length;
		this.resourcesAdded = await this.loadResourcesByGroups(groups);
	}

	static fastDetectLocal(timeout = 300) {
		return new Promise(resolve => {
			GM_xmlhttpRequest({
				method: "HEAD",
				url: this.LOCAL_BASE + "Source/Utils/Tool.js",
				timeout,
				onload: r => {
					if (r.status >= 200 && r.status < 400) {
						resolve(this.LOCAL_BASE);
					} else {
						resolve(this.ONLINE_BASE);
					}
				},
				onerror: () => resolve(this.ONLINE_BASE),
				ontimeout: () => resolve(this.ONLINE_BASE),
			});
		});
	}
}
