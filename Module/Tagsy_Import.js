class ResourceLoader {
	static resourcesAdded = 0;
	static resourcesTotal = 0;

	static ONLINE_BASE = "https://weavefate.asia/";
	static LOCAL_BASE = "http://127.0.0.1:5500/";

	/* ================= 工具 ================= */

	static loadJsAsync(jsUrl, baseUrl) {
		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = jsUrl + "?v=" + Date.now();
			script.dataset.dynamic = "true";
			script.dataset.source = baseUrl;
			script.onload = () => resolve(1);
			script.onerror = () => reject(new Error("Failed to load JS: " + jsUrl));
			document.head.appendChild(script);
		});
	}

	static loadCssAsync(cssUrl, baseUrl) {
		return new Promise((resolve, reject) => {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = cssUrl + "?v=" + Date.now();
			link.dataset.dynamic = "true";
			link.dataset.source = baseUrl;
			link.onload = () => resolve(1);
			link.onerror = () => reject(new Error("Failed to load CSS: " + cssUrl));
			document.head.appendChild(link);
		});
	}

	static async loadResourceAsync(url, baseUrl) {
		if (url.endsWith(".css")) {
			try {
				return await ResourceLoader.loadCssAsync(url, baseUrl);
			} catch {
				return 0;
			}
		}

		if (url.endsWith(".js")) {
			try {
				return await ResourceLoader.loadJsAsync(url, baseUrl);
			} catch {
				return 0;
			}
		}

		return 0;
	}

	static async loadResourcesParallel(resources, baseUrl) {
		const results = await Promise.all(
			resources.map(url => ResourceLoader.loadResourceAsync(url, baseUrl))
		);
		return results.reduce((sum, v) => sum + v, 0);
	}

	static async loadResourcesByGroups(groups, baseUrl) {
		let total = 0;
		for (const group of groups) {
			total += await ResourceLoader.loadResourcesParallel(group, baseUrl);
		}
		return total;
	}

	static removeDynamicResources() {
		const nodes = document.querySelectorAll(
			'script[data-dynamic="true"],link[data-dynamic="true"]'
		);
		nodes.forEach(n => n.remove());
	}

	/* ================= 资源列表 ================= */

	static buildResourceGroups(baseUrl) {
		return [
			[
				baseUrl + "Source/Utils/Tool.js",
			],
			[
				baseUrl + "Source/Core/Behavior.js",
				baseUrl + "Source/Core/Global.js",
				baseUrl + "Source/Core/HttpRequest.js",
				baseUrl + "Source/Core/Route.js",
			],
			[
				baseUrl + "Source/Global/QLabelGlobal.js",
				baseUrl + "Source/Global/LoginGlobal.js",
				baseUrl + "Source/Global/W2Global.js",
				baseUrl + "Source/Global/LSGlobal.js",
				baseUrl + "Source/Global/ApiboxGlobal.js",
				baseUrl + "Source/Global/SystemGlobal.js",
				baseUrl + "Source/Global/SettingGlobal.js",
				baseUrl + "Source/Global/QLabelEngineGlobal.js",
				baseUrl + "Source/Global/QLabelEngineEmbeddeGlobal.js",
			],
			[
				baseUrl + "Source/Global/FrameworkGlobal.js",
			],
			[
				baseUrl + "Source/Request/QLabelRequest.js",
				baseUrl + "Source/Request/JsonBinRequest.js",
				baseUrl + "Source/Request/W2Request.js",
				baseUrl + "Source/Request/LSRequest.js",
				baseUrl + "Source/Request/ApiboxRequest.js",
				baseUrl + "Source/Request/QLabelEngineRequest.js",
			],
			[
				baseUrl + "Source/Behavior/FrameworkBehavior.js",
				baseUrl + "Source/Behavior/SystemBehavior.js",
			],
			[
				baseUrl + "Source/Task/FrameworkTask.js",
			],
			[
				baseUrl + "Source/Behavior/QLabelBehavior.js",
				baseUrl + "Source/Behavior/LoginBehavior.js",
				baseUrl + "Source/Behavior/W2Behavior.js",
				baseUrl + "Source/Behavior/LSBehavior.js",
				baseUrl + "Source/Behavior/SettingBehavior.js",
				baseUrl + "Source/Behavior/QLabelEngineBehavior.js",
				baseUrl + "Source/Behavior/QLabelEngineEmbeddeBehavior.js",
			],
			[
				baseUrl + "Source/Page/FrameworkPage.js",
			],
			[
				baseUrl + "Source/Page/QLabelPage.js",
				baseUrl + "Source/Page/LoginPage.js",
				baseUrl + "Source/Page/W2Page.js",
				baseUrl + "Source/Page/LSPage.js",
				baseUrl + "Source/Page/SettingPage.js",
				baseUrl + "Source/Page/QLabelEnginePage.js",
			],
			[
				baseUrl + "Module/Common/Tagsy_Core.js",
			],
		];
	}

	/* ================= 加载入口 ================= */

	static async loadWithBaseUrl(baseUrl) {
		const groups = ResourceLoader.buildResourceGroups(baseUrl);
		ResourceLoader.resourcesTotal = groups.flat().length;
		ResourceLoader.resourcesAdded =
			await ResourceLoader.loadResourcesByGroups(groups, baseUrl);
	}

	static async loadOnline() {
		await ResourceLoader.loadWithBaseUrl(ResourceLoader.ONLINE_BASE);
	}

	static async loadLocal() {
		await ResourceLoader.loadWithBaseUrl(ResourceLoader.LOCAL_BASE);
	}

	/* ================= 本地检测与切换 ================= */

	static detectLocalAndSwitch() {
		const testFile =
			ResourceLoader.LOCAL_BASE + "Source/Utils/Tool.js";

		GM_xmlhttpRequest({
			method: "HEAD",
			url: testFile,
			timeout: 300,
			onload: res => {
				if (res.status >= 200 && res.status < 400) {
					ResourceLoader.switchToLocal();
				}
			},
		});
	}

	static async switchToLocal() {
		ResourceLoader.removeDynamicResources();
		await ResourceLoader.loadLocal();
	}

	/* ================= 启动 ================= */

	static async bootstrap() {
		await ResourceLoader.loadOnline();
		ResourceLoader.detectLocalAndSwitch();
	}
}

/* ===== 启动 ===== */
ResourceLoader.bootstrap();
