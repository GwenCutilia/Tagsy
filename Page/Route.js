class Route {
	static log = new Logger("Route");

	static routes = { 
		web: {
			"Login.html": () => new LoginWeb().init(),
			"Index.html": () => new IndexWeb().init(),
			"W2.html": () => new W2Web().init(),
			"QLabel.html": () => new QLabelWeb().init(),
			"LS.html": () => new LSWeb().init(),
			"WeCom.html": () => new WeComWeb().init(),
			"Setting.html": () => new SettingWeb().init(),
		},
		qlabel: {
			"/workbench/tasks": () => new QLabelWork().init(),
		}
	};

	static async init() {
		const path = location.pathname;
		const host = location.hostname;

		for (const groupKey in this.routes) {
			const group = this.routes[groupKey];

			// web 组匹配 web 页面
			if (groupKey === "web" && path.includes("Web")) {
				const matchedKey = Object.keys(group).find(key => path.endsWith(key));
				if (matchedKey) {
					// 先初始化 Page 的变量和任务
					await Page.initWebValue();
					await Page.loadTask();
					await Page.loadFramework();

					// 执行页面逻辑
					await group[matchedKey]();
					return;
				}
				this.log.warn("Web页面未匹配到具体逻辑:", path);
			}

			// qlabel 组匹配 qlabel.tencent.com 域名
			if (groupKey === "qlabel" && host === "qlabel.tencent.com") {
				const matchedKey = Object.keys(group).find(key =>
					path === key || path.startsWith(key + "/")
				);

				if (matchedKey) {
					await Page.initQLabelValue();
					await group[matchedKey]();
					return;
				}
			}
		}

		this.log.error("没有为该页面配置逻辑:", path);
	}
}