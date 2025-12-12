class Index extends Page {
	constructor() {
		super();
	}
}
class IndexWeb extends Index {
	constructor() {
		super();
	}
	async init() {
		this.initValue();
		this.initTask();
		this.bindEvents();
		this.updateUIElement();
	}

	bindEvents() {
		this.load_btn.addEventListener("click", async () => {
			await ResourceLoader.loadAllResources();
		});
	}
	async updateUIElement() {
		let task = [
			{
				// 加载状态
				action: async () => { 
					await this.loadingStatusTask();
				},
				intervalMs: 3000,
				name: "INDEX_LOADING_STATUS_TASK",
			},
			{
				// 工作时间
				action: async () => {
					await this.workHourTask();
				},
				intervalMs: 3000,
				name: "INDEX_WORK_HOUR_TASK",
			}
		]
		task.forEach(config => {
			TimerScheduler.setIntervalTask(
				config.action, 
				config.intervalMs, 
				config.name
			);
		});
	}
	// 初始化变量
	initValue() {
		this.domMap = IndexGlobal.domMap;
		Object.entries(this.domMap).forEach(([key, selectorDomID]) => {
			this[key] = DomHelper.bySelector(selectorDomID);
		});
	}
	// 初始化任务, 先运行一次任务
	async initTask() {
		await this.loadingStatusTask();
		await this.workHourTask();
		Framework.AllLoadedUIElement();
	}
	// 加载状态
	async loadingStatusTask() {
		this.loadingStatusValue = this.loading_status_label;
		if (Resource.AllLoaded()) {
			this.loadingStatusValue.innerText = "已加载";
		} else {
			this.loadingStatusValue.innerText = "加载异常";
		}
	}
	async runningStatusTask() {

	}
	async workHourTask() {
		let workedHours = parseFloat(Time.getWorkedHoursToday().toFixed(2));
		let remainHours = (8 - workedHours).toFixed(2);
		this.remain_hours_label.classList.remove("hidden");
		this.worked_hours_label.innerText = workedHours + " 小时";
		this.remain_hours_label.innerText = ", 距离下班还有 " + remainHours + " 小时";
	}
}