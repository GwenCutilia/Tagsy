class LSWeb extends Framework {
	async init() {
		await super.init();
		await this.initValue();
		await this.bindEvents();
		await this.initTask();
		await this.updateUIElement();
	}
	async initValue() {
		// 初始化Behavior
		Behavior.initDomMap(LSGlobal.domMap);
	}
	async initTask() {
		await LSBehaviorUpdateUIElement.loginStatus();
		await LSBehaviorUpdateUIElement.getDailyReportList();
		await LSBehaviorUpdateUIElement.fillDailyReportStatus();
		await LSBehaviorUpdateUIElement.dailyReportList();
		await FrameworkAddAuxiliaryLogic.AllLoadedUIElement();
	}
	// 事件绑定
	async bindEvents() {
		LSBehaviorBindEvents.initLSDomButtons();
	}
	// 刷新UI
	async updateUIElement() {
		let task = [
			{
				action: async () => {
					LSBehaviorUpdateUIElement.loginStatus();
				},
				intervalMs: 1000,
				name: LSGlobal.task.uiTask.login
			},
			{
				action: async () => {
					LSBehaviorUpdateUIElement.getDailyReportList();
				},
				intervalMs: 1000 * 30,
				name: LSGlobal.task.uiTask.getDailyReportList
			},
			{
				action: async () => {
					LSBehaviorUpdateUIElement.fillDailyReportStatus();
				},
				intervalMs: 1000,
				name: LSGlobal.task.uiTask.fillDailyReportStatus
			},
			{
				action: async () => {
					LSBehaviorUpdateUIElement.dailyReportList();
				},
				intervalMs: 1000 * 15,
				name: LSGlobal.task.uiTask.dailyReportList
			},
		];
		task.forEach(cofig => {
			TimerScheduler.setIntervalTask(
				cofig.action,
				cofig.intervalMs,
				cofig.name
			);
		});
	}
}