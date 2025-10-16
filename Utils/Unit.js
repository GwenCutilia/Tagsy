// 资源系统
class Resource {
	static scriptsNum = 0;
	static scriptsAdd = 0;
	static log = new Logger("Resource");
	static AllLoaded() {
		if (this.scriptsNum && this.scriptsAdd && this.scriptsAdd === this.scriptsNum) {
			Global.config.system.system_status = true;
			this.log.log("资源加载成功");
			return true;
		} else {
			this.log.error("资源加载失败");
			return false;
		}
	}
	static async LoadScript() {
		await LoadGlobalAllScripts();
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
