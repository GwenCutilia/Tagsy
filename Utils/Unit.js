// 资源系统
class Resource {
	static scriptsNum = 0;
	static scriptsAdd = 0;
	static log = new Logger("Resource");
	static AllLoaded() {
		if (Resource.scriptsNum && Resource.scriptsAdd && Resource.scriptsAdd === Resource.scriptsNum) {
			SystemGlobal.status.load = true;
			return true;
		} else {
			this.log.error("this.scriptsNum:" + Resource.scriptsNum + ", this.scriptsAdd:" + Resource.scriptsAdd);
			this.log.error("资源加载失败");
			return false;
		}
	}
	static async LoadScript() {
		await ScriptLoader.LoadGlobalAllScripts();
	}
}
// 运行系统
class Running {
	static startTime = new Date().getTime();
	static runningStatus = false;
	static log = new Logger("Running");
	static start() {
		Core();
	}
	static stop() {
		// 需要先写好运行的函数
	}
}
/**
 * Message 类 - 管理应用程序的通知功能(桌面通知)
 */
class Message {
	static log = new Logger("Resource");
	static async init() {
		if (!("Notification" in window)) {
			this.log.warn("当前浏览器不支持桌面通知");
			return;
		}
		if (Notification.permission === "default") {
			await Notification.requestPermission();
		}
	}

	static notify(options = {}) {
		const {
			title = "Tagsy",
			body = "",
			duration = 10000
		} = options;

		if (Notification.permission !== "granted") {
			this.log.warn("通知未授权");
			return;
		}

		const n = new Notification(title, {
			body,
		});

		// 点击通知后回到当前网页
		n.onclick = () => {
			window.focus();
		};

		if (duration > 0) {
			setTimeout(() => n.close(), duration);
		}

		return n;
	}
}
