// /*
// *********************
// 	***动态资源加载器***
// 	支持 JS 和 CSS 文件
// *********************
// */

if (!window.ResourceLoader) {
	class ResourceLoader {
		static resourcesAdded = 0; // 已成功加载数量
		static resourcesTotal = 0; // 总资源数量

		constructor() { }

		// 异步加载单个 JS 脚本
		static loadJsAsync(jsUrl) {
			return new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.src = jsUrl + `?v=${Date.now()}`; // 防缓存
				script.dataset.dynamic = "true";
				script.onload = () => resolve(1); // 成功返回 1
				script.onerror = () => reject(new Error(`Failed to load JS: ${jsUrl}`));
				document.head.appendChild(script);
			});
		}

		// 异步加载单个 CSS
		static loadCssAsync(cssUrl) {
			return new Promise((resolve, reject) => {
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.href = cssUrl + `?v=${Date.now()}`; // 防缓存
				link.onload = () => resolve(1); // 成功返回 1
				link.onerror = () => reject(new Error(`Failed to load CSS: ${cssUrl}`));
				document.head.appendChild(link);
			});
		}

		// 根据后缀动态选择 JS 或 CSS 加载
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
				return Promise.resolve(0);
			}
		}

		// 并行加载一组资源
		static async loadResourcesParallel(resources) {
			const results = await Promise.all(resources.map(url => ResourceLoader.loadResourceAsync(url)));
			return results.reduce((sum, val) => sum + val, 0); // 返回成功数量
		}

		// 分组顺序加载，每组内部并行
		static async loadResourcesByGroups(groups) {
			let totalSuccess = 0;
			for (const group of groups) {
				totalSuccess += await ResourceLoader.loadResourcesParallel(group);
			}
			return totalSuccess;
		}

		// 全局加载入口
		static async loadAllResources() {
			// 自动判断环境
			let Url;
			if (location.href.startsWith("file:///D:")) {
				Url = "file:///D:/Creat/VSCode/Tagsy_V2.0/Tagsy/";
			} else if (location.href.startsWith("file:///C:")) {
				Url = "file:///C:/ProgramData/Tagsy/";
			} else {
				Url = "https://weavefate.asia/";
			}

			const resourceGroups = [
				[
					// Url + "Resource/Lib/Font_Awesome/All.css",
					// Url + "Resource/Lib/Tail_Wind/Tail_Wind.js",
					Url + "Utils/Tool.js",
				],
				[
					Url + "Utils/Manager/Request.js",
					Url + "Utils/Manager/Page.js",
					Url + "Utils/Unit.js",
				],
				[
					Url + "Variable/Global.js",
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

	// 挂载到全局，防止重复声明
	window.ResourceLoader = ResourceLoader;
}