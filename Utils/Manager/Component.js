class RuntimeLogger {
	log = new Logger("RuntimeLogger");
	divPath = "#running_log_content";

	constructor(prefix = "RuntimeLogger") {
		this.prefix = prefix;
		if (!Array.isArray(GM.GetValue("running_log"))) {
			this.log.log("运行日志变量未初始化, 现已初始化");
			GM.SetValue("running_log", []);
		}
	}

	// 获取最新日志数组
	_getLogs() {
		const logs = GM.GetValue("running_log") || [];
		return Array.isArray(logs) ? logs : [];
	}

	// 写日志
	add(text) {
		const time = new Date();
		const logs = this._getLogs();
		logs.push(time.toLocaleTimeString() + " " + this.prefix + ": " + text);
		GM.SetValue("running_log", logs);
		this.log.log("日志已添加:", text);
	}

	// 清空日志
	clear() {
		GM.SetValue("running_log", []);
		this.log.log("运行日志已清空");
	}

	// 显示日志
	show() {
		if (!DomHelper.exists(this.divPath)) return;

		const container = DomHelper.bySelector(this.divPath);
		container.innerHTML = "";

		this._getLogs().forEach(entry => {
			const line = document.createElement("div");
			line.textContent = entry;
			container.appendChild(line);
		});
	}
}
