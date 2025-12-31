class TLabelWeb extends Framework {
	constructor() {
		super();
	}
	async init() {
		await super.init();
		await this.initValue();
		await this.bindEvents();
		await this.addAanimationEffect();
		await this.initTask();
		await this.updateUIElement();
	}
	async initValue() {
		// 初始化Behavior
		Behavior.initDomMap(TLabelGlobal.domMap);
	}
	// 初始化任务, 先运行一次任务
	async initTask() {
		
		await FrameworkAddAuxiliaryLogic.AllLoadedUIElement();
	}
	async bindEvents() {
		
	}
	async addAanimationEffect() {
		
	}
	async updateUIElement() {
		// QLabelBehaviorHelperUtils.addTooltipMessage();
		let task = [
			{
				// action: async () => {
				// 	await QLabelBehaviorUpdateUIElement.annotationList();
				// },
				// intervalMs: 1000 * 60 * 2,
				// name: QLabelGlobal.task.uiTask.annotationList
			}, 
			{
				// action: async () => {
				// 	await QLabelBehaviorUpdateUIElement.workHour();
				// },
				// intervalMs: 1000 * 60 * 1,
				// name: QLabelGlobal.task.uiTask.workHour
			},
			{
				// action: async () => {
				// 	await QLabelBehaviorUpdateUIElement.updateHomeworkLoadProgress();
				// },
				// intervalMs: 1000 * 1,
				// name: QLabelGlobal.task.uiTask.homeworkLoadTatistics
			}
		];
		// task.forEach(cofig => {
		// 	TimerScheduler.setIntervalTask(
		// 		cofig.action,
		// 		cofig.intervalMs,
		// 		cofig.name
		// 	);
		// });
	}
	
}