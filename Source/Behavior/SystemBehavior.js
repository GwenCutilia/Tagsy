class SystemBehavior {
	static async isFirstRun() {
		if (SystemGlobal.cache.guide.isFirstRun === true) {
			await beginGuide();
		}
	}
	static setDeveloperMode() {

	}
	// 开始引导
	static beginGuide() {
		location.href = "./Setting.html";
		
	}
}