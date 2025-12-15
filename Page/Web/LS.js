class LS extends Page {
	constructor() {
		super();
	}
}
class LSWeb extends LS {
	async init() {
		this.initValue();
		this.initTask();
		this.bindEvents();
		this.updateUIElement();
	}
	initValue() {
		this.domMap = LSGlobal.domMap;
		Object.entries(this.domMap).forEach(([key, selectorDomID]) => {
			this[key] = DomHelper.bySelector(selectorDomID);
		});
	}
	async initTask() {
		await this.loginStatus();
		await this.getDailyReportList();
		await this.fillDailyReportStatus();
		await this.dailyReportList();
		Framework.AllLoadedUIElement();
	}
	// 登录
	static async login() {
		// 从这里继续, 写ls的登录逻辑
		if (LSGlobal.cache.information.name == null && LSGlobal.cache.information.password === null) {
			this.log.error("LS用户名或密码为失效");
			LSGlobal.status.login = LSGlobal.statusMap.loginStatus.failed;
			return;
		}
		const result = await LSRequest.login();
		if (result.code === 200) {
			this.log.log("LS登录成功");
			LSGlobal.status.login = LSGlobal.statusMap.loginStatus.success;
		} else {
			this.log.error("LS登录失败");
			LSGlobal.status.login = LSGlobal.statusMap.loginStatus.failed;
		}
		if (LSGlobal.cache.cookie.sub_task_id === null) {
			let result = await LSRequest.getPersonalInformat();
			if (result.code === 200) {
				this.log.log("获取项目工作区信息成功");
			} else {
				this.log.error("LS -> login() -> 获取项目工作区信息失败");
			}
		}
		if (LSGlobal.cache.cookie.id === null || LSGlobal.cache.cookie.task_id === null) {
			let result = await LSRequest.getInfo();
			if (result.code === 200) {
				this.log.log("获取个人信息成功");
			} else {
				this.log.error("LS -> login() -> 获取个人信息失败");
			}
		}
		if (LSGlobal.cache.cookie.name === null) {
			await LSRequest.getFillDailyReportName();
		}
	}
	// 退出登录
	static async loginOut() {
		await LSRequest.loginOut();
		LSGlobal.status.login = LSGlobal.statusMap.loginStatus.out;
	}
	// 心跳 如果LS的掉线了再做
	static async loginCheck() {
		
	}
	// 填写日报
	static async fillDailyReport() {
		let result = await LSRequest.fillDailyReport();
		if (result.code === 200) {
			this.log.log("填写日报成功, 返回信息: ", result.msg);
			Message.notify({body: "LS 日报填写成功"});
		} else {
			this.log.error("填写日报失败, 返回信息: ", result.msg);
		}
	}
	// 事件绑定
	bindEvents() {
		this.login_btn.addEventListener("click", async () => {
			await LSWeb.login();
		});
		this.login_out_btn.addEventListener("click", async () => {
			await LSWeb.loginOut();
			LSGlobal.status.login = LSGlobal.statusMap.loginStatus.out;
		});
		this.fill_daily_report_btn.addEventListener("click", async () => {
			await LSWeb.fillDailyReport();
		});
	}
	// 刷新UI
	async updateUIElement() {
		let task = [
			{
				action: async () => {
					this.loginStatus();
				},
				intervalMs: 1000,
				name: LSGlobal.task.uiTask.login
			},
			{
				action: async () => {
					this.getDailyReportList();
				},
				intervalMs: 1000,
				name: LSGlobal.task.uiTask.getDailyReportList
			},
			{
				action: async () => {
					this.fillDailyReportStatus();
				},
				intervalMs: 1000,
				name: LSGlobal.task.uiTask.fillDailyReportStatus
			},
			{
				action: async () => {
					this.dailyReportList();
				},
				intervalMs: 1500,
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
		// // 登录状态UI
		// TimerScheduler.setIntervalTask(async () => { this.loginStatus() }, 1000, LSGlobal.task.uiTask.login);
		// // 刷新日报列表的任务
		// TimerScheduler.setIntervalTask(async () => { this.getDailyReportList() }, 1000, LSGlobal.task.uiTask.getDailyReportList);
		// // 打卡任务UI
		// TimerScheduler.setIntervalTask(async () => { this.fillDailyReportStatus() }, 1000, LSGlobal.task.uiTask.fillDailyReportStatus);
		// // 日报列表UI
		// TimerScheduler.setIntervalTask(async () => { this.dailyReportList() }, 1500, LSGlobal.task.uiTask.dailyReportList);
	}
	// 登录状态刷新
	async loginStatus() {
		this.login_status_label.innerText = LSGlobal.status.login;
	}
	async getDailyReportList() {
		let result = await LSRequest.getDailyReportList();
		if (result.code === 200) {
			
			LSGlobal.cache.dailyReport.list = result;
		} else {
			this.log.error("LS -> getDailyReportList -> 获取日报列表失败");
		}
	}
	// 日报打卡状态
	async fillDailyReportStatus() {
		// 如果检测到当天的记录, 就更新打卡成功
		let result = LSGlobal.cache.dailyReport.list;
		if (result === null) {
			return;
		}
		if (result.code === 200) {
			if (Time.isSameDay(result.rows[0].recordTime, Time.getCurrentDate())) {
				this.fill_daily_report_label.innerText = LSGlobal.statusMap.dailyReportStatus.already;
			} else {
				this.fill_daily_report_label.innerText = LSGlobal.statusMap.dailyReportStatus.not;
			}
		} else {
			this.fill_daily_report_label.innerText = LSGlobal.statusMap.unknown;
		}
	}
	// 日报列表
	async dailyReportList() {
		const daily_report_list_loading = this.daily_report_list_loading;
		let result = LSGlobal.cache.dailyReport.list;
		if (result === null) {
			return;
		}
		daily_report_list_loading.classList.add("hidden");
		this.daily_report_list_table.innerHTML = '';
		if (result.code === 200) {
			result.rows.forEach(item => {
				const date = item.recordTime.split('T')[0];
				const hours = Math.floor(item.workHours);
				const minutes = Math.round((item.workHours - hours) * 60);
				// 创建单条记录容器
				const recordDiv = document.createElement('div');
				recordDiv.className = 'flex justify-between items-center bg-gray-50 hover:bg-blue-50 transition shadow-sm rounded-xl px-4 py-3 border border-gray-100';
				// 时间
				const timeDiv = document.createElement('div');
				timeDiv.className = 'flex flex-col';
				const timeLabel = document.createElement('span');
				timeLabel.className = 'text-gray-500 text-xs';
				timeLabel.textContent = '时间';
				const timeValue = document.createElement('span');
				timeValue.className = 'text-base font-semibold text-gray-800';
				timeValue.textContent = date;
				timeDiv.appendChild(timeLabel);
				timeDiv.appendChild(timeValue);
				// 标注数据量
				const labelDiv = document.createElement('div');
				labelDiv.className = 'flex flex-col text-center';
				const labelLabel = document.createElement('span');
				labelLabel.className = 'text-gray-500 text-xs';
				labelLabel.textContent = '标注数据量';
				const labelValue = document.createElement('span');
				labelValue.className = 'text-green-600 font-semibold text-base';
				labelValue.textContent = item.labelCount;
				labelDiv.appendChild(labelLabel);
				labelDiv.appendChild(labelValue);

				// 质检数据量
				const checkDiv = document.createElement('div');
				checkDiv.className = 'flex flex-col text-center';
				const checkLabel = document.createElement('span');
				checkLabel.className = 'text-gray-500 text-xs';
				checkLabel.textContent = '质检数据量';
				const checkValue = document.createElement('span');
				checkValue.className = 'text-blue-600 font-semibold text-base';
				checkValue.textContent = item.checkCount;
				checkDiv.appendChild(checkLabel);
				checkDiv.appendChild(checkValue);

				// 工作时长
				const workDiv = document.createElement('div');
				workDiv.className = 'flex flex-col text-center';
				const workLabel = document.createElement('span');
				workLabel.className = 'text-gray-500 text-xs';
				workLabel.textContent = '工作时长';
				const workValue = document.createElement('span');
				workValue.className = 'text-gray-800 font-semibold text-base';
				workValue.textContent = `${hours}h ${minutes}m`;
				workDiv.appendChild(workLabel);
				workDiv.appendChild(workValue);
				// 组合所有子元素
				recordDiv.appendChild(timeDiv);
				recordDiv.appendChild(labelDiv);
				recordDiv.appendChild(checkDiv);
				recordDiv.appendChild(workDiv);

				// 添加到容器
				this.daily_report_list_table.appendChild(recordDiv);
			})
		}
	}
	// 清除打卡状态
	async clearDailyReportStatus() {
		LSGlobal.status.login = LSGlobal.statusMap.unknown;
	}
	// 定时任务
	static async currentTask() {
		// // 模块时间区间任务设置
		// time_range_login_start: "08:50",
		// time_range_login_end: "08:50",
		// time_range_login_out_start: "18:35", 
		// time_range_login_out_end: "18:35", 
		// time_range_fill_daily_report_start: "17:00",
		// time_range_fill_daily_report_end: "17:00",
		
		LSGlobal.setting.time_range_login_start
		const taskConfigs = [
			{
				start: LSGlobal.setting.time_range_login_start,
				end: LSGlobal.setting.time_range_login_end,
				action: async () => { await LS.login() },
				name: LSGlobal.task.dailyTask.login
			},
			{
				start: LSGlobal.setting.time_range_login_out_start,
				end: LSGlobal.setting.time_range_login_out_end,
				action: async () => { await LS.loginOut() },
				name: LSGlobal.task.dailyTask.loginOut
			},
			{
				start: LSGlobal.setting.time_range_fill_daily_report_start,
				end: LSGlobal.setting.time_range_fill_daily_report_end,
				action: async () => { 
					await LSWeb.fillDailyReport() ;
				},
				name: LSGlobal.task.dailyTask.fillDailyReport
			}
		]
		// if (!await W2.isTodayOff()) {
			for (const config of taskConfigs) {
				TimerScheduler.setDailyTask(
					Time.getRandomTimeInRange(config.start, config.end),
					config.action,
					config.name
				);
			}
			this.log.log("今天是工作日, 定时任务已启动");
		// } else {
			// LS.stopAllTask();
		// 	this.log.log("今天是休息日");
		// }
	}
}