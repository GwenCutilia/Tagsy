// /*
// *********************
// 	***动态资源加载器***
// 	支持 JS 和 CSS 文件
// *********************
// */

if (!window.ResourceLoader) {
	class ResourceLoader {
		static resourcesAdded = 0;
		static resourcesTotal = 0;

		constructor() { }

		static getRealUrl() {
			try {
				// 强制获取真实浏览器上下文
				return unsafeWindow.location.href;
			} catch (e) {
				// 退而求其次
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

		static async loadAllResources() {
			const href = ResourceLoader.getRealUrl();

			let Url;

			if (href.startsWith("https://qlabel.tencent.com/workbench/tasks/")) {
				// 使用本地开发服务器
				Url = "http://127.0.0.1:5500/";
			} else {
				// 默认线上地址
				Url = "https://weavefate.asia/";
			}

			const resourceGroups = [
				[
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

	window.ResourceLoader = ResourceLoader;
}

// Tagsy_Test.js
async function test() {
	// 初始化设置
	log = new Logger("Test");
	// 页面加载时实例化

}
// (function() {
// 	const canvasEl = document.querySelector('.upper-canvas');

// 	if (!canvasEl) return;

// 	// 创建悬浮显示的元素
// 	const coordDisplay = document.createElement('div');
// 	coordDisplay.style.position = 'absolute';
// 	coordDisplay.style.pointerEvents = 'none'; // 不阻挡鼠标事件
// 	coordDisplay.style.background = 'rgba(0,0,0,0.7)';
// 	coordDisplay.style.color = '#fff';
// 	coordDisplay.style.padding = '2px 5px';
// 	coordDisplay.style.fontSize = '12px';
// 	coordDisplay.style.borderRadius = '4px';
// 	coordDisplay.style.zIndex = '9999';
// 	document.body.appendChild(coordDisplay);

// 	// 获取 canvas 相对于页面的位置
// 	function getCanvasOffset() {
// 		const rect = canvasEl.getBoundingClientRect();
// 		return { left: rect.left + window.scrollX, top: rect.top + window.scrollY };
// 	}

// 	canvasEl.addEventListener('mousemove', (e) => {
// 		const offset = getCanvasOffset();
// 		const x = e.pageX - offset.left;
// 		const y = e.pageY - offset.top;

// 		// 更新悬浮显示内容和位置
// 		coordDisplay.textContent = `x: ${Math.round(x)}, y: ${Math.round(y)}`;
// 		coordDisplay.style.left = e.pageX + 10 + 'px'; // 鼠标右下角
// 		coordDisplay.style.top = e.pageY + 10 + 'px';
// 	});

// 	canvasEl.addEventListener('mouseleave', () => {
// 		coordDisplay.style.display = 'none'; // 鼠标离开隐藏
// 	});

// 	canvasEl.addEventListener('mouseenter', () => {
// 		coordDisplay.style.display = 'block';
// 	});
// })();