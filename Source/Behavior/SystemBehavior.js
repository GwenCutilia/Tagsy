class SystemBehavior {
	static async isFirstRun() {
		this.log = new Logger("SystemBehavior");
		if (SystemGlobal.cache.guide.isFirstRun === true) {
			this.log.log("这是第一次运行, 开始引导");
			this.beginGuide();
		}
	}
	static setDeveloperMode() {

	}
	// 开始引导, 目前是简易以后更改成完全引导
	static beginGuide() {
		location.href = "./Help.html";
		SystemGlobal.cache.guide.isFirstRun = false;
	}
}