class QLabelWeb extends Framework {
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
		Behavior.initDomMap(QLabelGlobal.domMap);
	}
	// 初始化任务, 先运行一次任务
	async initTask() {
		await QLabelBehaviorUpdateUIElement.workHour();
		await QLabelBehaviorUpdateUIElement.annotationList();
		await QLabelBehaviorUpdateUIElement.updateHomeworkLoadProgress();
		await FrameworkAddAuxiliaryLogic.AllLoadedUIElement();
	}
	async bindEvents() {
		await QLabelBehaviorBindEvents.checkPreviousDay(); // 查看上一天的作业数量
		await QLabelBehaviorBindEvents.checkNextDay(); // 查看下一天的作业数量
		await QLabelBehaviorBindEvents.reflash(); // 刷新当前的作业数量列表
	}
	async addAanimationEffect() {
		await QLabelBehaviorAddAanimationEffect.initDatePicker(); // 初始化日期选择器
	}
	async updateUIElement() {
		QLabelBehaviorHelperUtils.addTooltipMessage();
		let task = [
			{
				action: async () => {
					await QLabelBehaviorUpdateUIElement.annotationList();
				},
				intervalMs: 1000 * 60 * 2,
				name: QLabelGlobal.task.uiTask.annotationList
			}, 
			{
				action: async () => {
					await QLabelBehaviorUpdateUIElement.workHour();
				},
				intervalMs: 1000 * 60 * 1,
				name: QLabelGlobal.task.uiTask.workHour
			},
			{
				action: async () => {
					await QLabelBehaviorUpdateUIElement.updateHomeworkLoadProgress();
				},
				intervalMs: 1000 * 1,
				name: QLabelGlobal.task.uiTask.homeworkLoadTatistics
			}
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