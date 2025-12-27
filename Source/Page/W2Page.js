class W2Web extends Framework {
	constructor() {
		super();
	}

	async init() {
		await super.init();
		await this.initValue();
		await this.bindEvents();
		await this.initTask();
		await this.updateUIElement();
		await this.addAanimationEffect(); // 添加动画效果
	}
	async initValue() {
		Behavior.initDomMap(W2Global.domMap);
	}
	async initTask() {
		this.log.debug("initTask 运行开始");
		this.log.debug("initTask 运行完毕");
		await W2BehaviorUpdateUIElement.loginStatusTask();
		await W2BehaviorUpdateUIElement.getPersonalInformat();
		W2BehaviorUpdateUIElement.workingStatusTask();
		W2BehaviorUpdateUIElement.workHourStatusTask();
		W2BehaviorUpdateUIElement.currentTimeLineTask();
		W2BehaviorUpdateUIElement.calendarTask();
		W2BehaviorUpdateUIElement.applyActivityTransferList();
		await FrameworkAddAuxiliaryLogic.AllLoadedUIElement();
	}
	async bindEvents() {
		await W2BehaviorBindEvents.loginClick();
		await W2BehaviorBindEvents.loginOutClick();
		await W2BehaviorBindEvents.mealWorkingStatusClick();
		await W2BehaviorBindEvents.checkInOutClick();
		await W2BehaviorBindEvents.currentTaskClick();
		await W2BehaviorBindEvents.calendarNavClick();
		await W2BehaviorBindEvents.applyActivityTransferClick();
		await W2BehaviorBindEvents.applyActivityTransferPageClick();
	}
	async updateUIElement() {
		W2BehaviorHelperUtils.addTooltipMessage();
		let task = [
			{
				action: async () => {
					W2BehaviorUpdateUIElement.loginStatusTask();
					
				},
				intervalMs: 1000,
				name: W2Global.task.uiTask.login
			},
			{
				action: async () => {
					W2BehaviorUpdateUIElement.workingStatusTask();
				},
				intervalMs: 1000,
				name: W2Global.task.uiTask.working
			},
			{
				action: async () => {
					W2BehaviorUpdateUIElement.workHourStatusTask();
				},
				intervalMs: 1500,
				name: W2Global.task.uiTask.workHour
			},
			{
				action: async () => {
					W2BehaviorUpdateUIElement.currentTimeLineTask();
				},
				intervalMs: 1000,
				name: W2Global.task.uiTask.currentTimeLine
			},
			{
				action: async () => {
					W2BehaviorUpdateUIElement.getPersonalInformat();
				},
				intervalMs: 1000 * 3,
				name: W2Global.task.uiTask.personal
			},
			{
				action: async () => {
					W2BehaviorUpdateUIElement.calendarTask();
				},
				intervalMs: 1000 * 60,
				name: W2Global.task.uiTask.calendar
			},
			{
				action: async () => {
					W2BehaviorUpdateUIElement.applyActivityTransferList();
				},
				intervalMs: 1000 * 60,
				name: W2Global.task.uiTask.applyActivityTransferList
			},
		]
		task.forEach(cofig => {
			TimerScheduler.setIntervalTask(
				cofig.action,
				cofig.intervalMs,
				cofig.name
			);
		});
	}

	async addAanimationEffect() {
		W2AddAanimationEffect.initApplyActivityTransferDropdown();
	}
}