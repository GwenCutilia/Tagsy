class Page {
	static log = new Logger("Page");

	constructor() {
		this.tooltip = new ToolTip();
		this.log = new Logger(this.constructor.name);
	}

	// 原来的 init 方法可以保留给页面自己调用（如果需要）
	static async init() {
		this.log.log('页面 init 方法调用');
	}

	// 单独的初始化变量、任务和框架的方法，用于 Route 调用
	static async initAll() {
		await this.initWebValue();
		await this.loadTask();
		await this.loadFramework();
		this.log.log('Page初始化完成');
	}

	// 初始化全局变量
	static async initWebValue() {
		await LoginGlobal.init();
		await W2Global.init();
		await QLabelGlobal.init();
		await LSGlobal.init();
		await ApiboxGlobal.init();
		await FrameworkGlobal.init();
		await SystemGlobal.init();
		await QLabelWorkGlobal.init();
	}
	static async initQLabelValue() {
		await QLabelWorkGlobal.init();
	}
	// 初始化任务
	static async loadTask() {
		await this.W2Task();
		await this.LSTask();
	}

	// 初始化框架
	static async loadFramework() {
		W2Request.getLoginPage();
		await this.initPage();

		// 如果不是本地路径, 才初始化消息通知
		if (location.protocol !== "file:") {
			await Message.init();
		}

		new Framework();
	}

	// 页面跳转逻辑
	static async initPage() {
		if (location.pathname.endsWith("Login.html")) {
			if (LoginGlobal.status.login === true) {
				location.href = "./Index.html";
			}
			return;
		}

		if (LoginGlobal.status.login === false) {
			location.href = "./Login.html";
		}
	}

	// W2任务
	static async W2Task() {
		await W2Web.login();
		await W2Web.intervalTask();
		await W2Web.currentTask();
	}

	// LS任务
	static async LSTask() {
		await LSWeb.login();
		await LSWeb.currentTask();
	}
}