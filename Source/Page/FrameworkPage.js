// 界面逻辑
class Framework {
	// 框架初始化
	constructor() {
		this.tooltip = new ToolTip();
		this.log = new Logger(this.constructor.name);
	}
	async init() {
		await this._initGlobalTask();
		await this._initValue();
		await this._initTask();
		await this._updateUIElement();
		await this._addAuxiliaryLogic();
		await this._addAanimationEffect();
	}
	async _initValue() {
		// 初始化 FrameworkGlobal dom
		// 初始化 Behavior
		Behavior.initContext(this);
		Behavior.initDomMap(FrameworkGlobal.domMap);
	}
	async _initTask() {
		FrameworkUpdateUIElement.avatarImg();
		FrameworkUpdateUIElement.getNotice();
		FrameworkUpdateUIElement.modelStatus();
		FrameworkUpdateUIElement.weatherComponent();
	}
	async _initGlobalTask() {
		await FrameworkTask.initValue(); // 加载变量
		await W2Request.getLoginPage(); // 获取W2页面
		await FrameworkAddAuxiliaryLogic.jumpPage(); // 如果没登录的逻辑
		FrameworkTask.loadTask(); // 加载任务
		this.log.log("Page初始化完成");
	}
	async _updateUIElement() {
		let task = [
			{
				action: async () => {
					FrameworkUpdateUIElement.getNotice();
				},
				intervalMs: 1000 * 60 * 3,
				name: "FRAMEWORK_GET_NOTICE_TASK"
			},
			{
				action: async () => {
					FrameworkUpdateUIElement.modelStatus();
				},
				intervalMs: 1000 * 60 * 2,
				name: "FRAMEWORK_MODEL_STATUS_TASK"
			}
		]
		task.forEach(cofig => {
			TimerScheduler.setIntervalTask(
				cofig.action,
				cofig.intervalMs,
				cofig.name
			);
		});
	}
	// 添加动画效果
	async _addAanimationEffect() {
		FrameworkAddAanimationEffect.noticePanelAnimation();
	}
	// 添加辅助逻辑
	async _addAuxiliaryLogic() {
		FrameworkAddAuxiliaryLogic.addEffectsForButton();
		FrameworkAddAuxiliaryLogic.addSelectNoneClassExceptFormElements();
	}
}