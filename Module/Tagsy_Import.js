if (!window.ResourceLoader) {
	class ResourceLoader {
		static resourcesAdded = 0;
		static resourcesTotal = 0;

		constructor() { }

		static getRealUrl() {
			try {
				return unsafeWindow.location.href;
			} catch (e) {
				try {
					return document.currentScript.ownerDocument.URL;
				} catch (err) {
					return window.location.href;
				}
			}
		}

		static loadJsAsync(jsUrl) {
			return new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.src = jsUrl + `?v=${Date.now()}`;
				script.dataset.dynamic = "true";
				script.onload = () => resolve(1);
				script.onerror = () => reject(new Error(`Failed to load JS: ${jsUrl}`));
				document.head.appendChild(script);
			});
		}

		static loadCssAsync(cssUrl) {
			return new Promise((resolve, reject) => {
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.href = cssUrl + `?v=${Date.now()}`;
				link.onload = () => resolve(1);
				link.onerror = () => reject(new Error(`Failed to load CSS: ${cssUrl}`));
				document.head.appendChild(link);
			});
		}

		static async loadResourceAsync(url) {
			if (url.endsWith(".css")) {
				try {
					return await ResourceLoader.loadCssAsync(url);
				} catch (err) {
					console.error(err);
					return 0;
				}
			} else if (url.endsWith(".js")) {
				try {
					return await ResourceLoader.loadJsAsync(url);
				} catch (err) {
					console.error(err);
					return 0;
				}
			} else {
				console.warn("Unknown resource type:", url);
				return 0;
			}
		}

		static async loadResourcesParallel(resources) {
			const results = await Promise.all(
				resources.map(url => ResourceLoader.loadResourceAsync(url))
			);
			return results.reduce((sum, v) => sum + v, 0);
		}

		static async loadResourcesByGroups(groups) {
			let totalSuccess = 0;
			for (const group of groups) {
				totalSuccess += await ResourceLoader.loadResourcesParallel(group);
			}
			return totalSuccess;
		}

		static async testUrl(url) {
			// 尝试 fetch 本地资源，看是否可用
			try {
				const response = await fetch(url, { method: "HEAD", cache: "no-store" });
				return response.ok;
			} catch (e) {
				return false;
			}
		}

		static async loadAllResources() {
			const href = ResourceLoader.getRealUrl();
			let Url = "";

			// 判断 @match 地址
			if (href.startsWith("https://qlabel.tencent.com/workbench/tasks/")) {
				const localUrl = "http://127.0.0.1:5500/";
				const testFile = localUrl + "Utils/Tool.js";
				const localAvailable = await ResourceLoader.testUrl(testFile);
				Url = localAvailable ? localUrl : "https://weavefate.asia/";
			} else if (href.startsWith("file:///D:")) {
				Url = "file:///D:/Creat/VSCode/Tagsy_V2.0/Tagsy/";
			} else if (href.startsWith("file:///C:")) {
				Url = "file:///C:/ProgramData/Tagsy/";
			} else {
				Url = "https://weavefate.asia/";
			}

			const resourceGroups = [
				[
					Url + "Utils/Tool.js",
				],
				[
					Url + "Utils/Global.js",
				],
				[
					Url + "Utils/Route.js",
					Url + "Page/Page.js",
					Url + "Page/Requset/Request.js",
				],
				[
					Url + "Page/WebSite/Framework.js",
					Url + "Page/WebSite/Index.js",
					Url + "Page/WebSite/Login.js",
					Url + "Page/WebSite/W2.js",
					Url + "Page/WebSite/LS.js",
					Url + "Page/WebSite/QLabel.js",
					Url + "Page/WebSite/Setting.js",
					Url + "Page/WebSite/Wecom.js",
					Url + "Page/Extension/QLabel.js"
				],
				[
					Url + "Module/Tagsy_Import.js",
					Url + "Module/Common/Tagsy_Core.js",
				]
			];

			ResourceLoader.resourcesTotal = resourceGroups.flat().length;
			ResourceLoader.resourcesAdded = await ResourceLoader.loadResourcesByGroups(resourceGroups);

			Resource.scriptsNum = ResourceLoader.resourcesTotal;
			Resource.scriptsAdd = ResourceLoader.resourcesAdded;
		}
	}

	window.ResourceLoader = ResourceLoader;
}