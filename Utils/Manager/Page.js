// 
class Page {
	// 静态属性: 日志和路由配置
	static log = new Logger("Page");
	static routes = {
		"Index.html": () => new Index(),
		"W2.html": () => new W2(),
		"Setting.html": () => new Setting(),
		// 可添加其他页面路由
	};

	// 实例属性: 每个页面实例的日志
	constructor() {
		this.runtimeLog = new RuntimeLogger(this.constructor.name); // 以类名作为日志标识
		this.log = new Logger(this.constructor.name);
	}

	// 静态方法: 初始化页面路由
	static async init() {
		await Template.init();
		const page = location.pathname.split("/").pop();
		if (this.routes[page]) {
			this.routes[page]();
		} else {
			this.log.error("没有为该页面配置逻辑:", page);
		}
	}

	bindEvents() {

	}

	init() {

	}
}
class Template {
    static log = new Logger("Template");
    static async init() {
		if (!this.isTemplatePage()) {
            return;
        }
        await Template.loadTask();
        this.log.log('Template初始化完成');
    }
	static async loadTask() {
		await W2Request.getLoginPage();
		await W2.login();
		// 为每日任务写单独的函数出来
		// 在登录成功后禁用登录按钮 待定, 有空再看看要不要添加这个功能
		// 添加一个重新登录的按钮监听事件
		// 当前任务卡有bug, 每一次更新ui时将所有ui更新
		await W2.currentTask();
		TimerScheduler.setIntervalTask(W2.currentTask.bind(this), 60 * 1000 * 60, "W2_CURRENT_TASK");
	}
    static isTemplatePage() {
        return location.pathname.includes('/Template/');
    }
}
class Index extends Template {
	clearID = "#clear_log_btn"; // 清空日志按钮
	loadingStatusValueID = "#loading_status_value"; // 加载状态显示
	SYSTEM_OPERATING_STATUSValueID = "#operating_status_value"; // 运行状态显示
	btnLoadID = "#btn_load"; // 加载按钮
	btnUnloadID = "#btn_unload"; // 卸载按钮
	SYSTEM_RUNNING_TIMEValueID = "#running_time_value"; // 运行时间显示
	constructor() {
		super();
		this.bindEvents();
		this.init();
		this.updateUIElement();
	}
	bindEvents() {
		if (DomHelper.exists(this.clearID)) {
			DomHelper.bySelector(this.clearID).addEventListener("click", () => {
				this.runtimeLog.clear();
			});
		}
		if (DomHelper.exists(this.btnLoadID)) {
			DomHelper.bySelector(this.btnLoadID).addEventListener("click", async () => {
				Global.config.system.system_status = false;
				await LoadGlobalAllScripts();
				Resource.AllLoaded();
				DomHelper.bySelector(this.loadingStatusValueID).innerText = "已加载";
			});
		}
		if (DomHelper.exists(this.btnUnloadID)) {
			DomHelper.bySelector(this.btnUnloadID).addEventListener("click", () => {
				Global.config.system.system_status = false;
				Resource.scriptsNum = 0;
				Resource.scriptsAdd = 0;
				// 清空日志等全局单例
				if (window.runtimeLogger) {
					window.runtimeLogger.clear();
				}
				// 删除所有动态加载的 <script>
				DomHelper.allBySelector('script[data-dynamic="true"]').forEach(s => s.remove());

				this.log.log("所有动态加载脚本已卸载");
				Resource.AllLoaded();
				DomHelper.bySelector(this.loadingStatusValueID).innerText = "未加载";
			});
		}
	}
	updateUIElement() {
		// 加载状态
		this.loadingStatusValue = DomHelper.bySelector(this.loadingStatusValueID);
		this.log.debug("loadingStatusValue: ", this.loadingStatusValue);
		if (Resource.AllLoaded() && DomHelper.exists(this.loadingStatusValueID)) {
			this.loadingStatusValue.innerText = "已加载";
			this.runtimeLog.add("已加载资源");
		} else {
			this.loadingStatusValue.innerText = "加载异常";
			this.runtimeLog.add("资源加载异常");
		}
		// 运行状态
		// this.SYSTEM_OPERATING_STATUSValue = DomHelper.bySelector(this.SYSTEM_OPERATING_STATUSValueID)
		// if (this.loadingStatusValue.innerText === "已加载" && DomHelper.exists(this.SYSTEM_OPERATING_STATUSValueID)) {
		// 	this.SYSTEM_OPERATING_STATUSValue.innerText = "正在运行";
		// } else {
		// 	this.SYSTEM_OPERATING_STATUSValue.innerText = "运行异常";
		// }
	}
	async init() {
		this.loggerShow();
		// 检查W2运行环境
		if (Global.config.w2.w2_user_name === null) {
			this.runtimeLog.add("W2账号未填写, 请于设置填写账号信息");
			this.runtimeLog.add("W2模块已停止运行");
			// 停止W2模块
			TimerScheduler.stopAllTasks();
		}
	}
	async loggerShow() {
		// 启动日志
		while (true) {
			await System.sleepSeconds(1);
			this.runtimeLog.show();
		}
	}
}
class W2 extends Page {
	w2_login_status_label = DomHelper.bySelector("#w2_login_status_label"); // 登录状态
	w2_check_in_out_label = DomHelper.bySelector("#w2_check_in_out_label"); // 考勤打卡状态
	w2_meal_working_status_label = DomHelper.bySelector("#w2_meal_working_status_label"); // 工作状态
	w2_login_btn = DomHelper.bySelector("#w2_login_btn"); // 登录按钮
	w2_relogin_btn = DomHelper.bySelector("#w2_relogin_btn"); // 重新登录按钮
	w2_login_out_btn = DomHelper.bySelector("#w2_login_out_btn"); // 退出登录按钮
	check_in_btn = DomHelper.bySelector("#check_in_btn"); // 打卡按钮
	check_out_btn = DomHelper.bySelector("#check_out_btn"); // 下班按钮
	w2_meal_working_status_btn = DomHelper.bySelector("#w2_meal_working_status_btn"); // 切换状态按钮
	current_time_line_task_start_btn = DomHelper.bySelector("#current_time_line_task_start_btn"); // 开始W2任务按钮
	current_time_line_task_stop_btn = DomHelper.bySelector("#current_time_line_task_stop_btn"); // 停止W2任务按钮
	current_time_line_task_turn_on_off_i = DomHelper.bySelector("#current_time_line_task_turn_on_off_i"); // 任务开关图标
	current_time_line_task_icon_0 = DomHelper.bySelector("#current_time_line_task_icon_0"); // 任务1图标
	current_time_line_task_icon_1 = DomHelper.bySelector("#current_time_line_task_icon_1"); // 任务2图标
	current_time_line_task_icon_2 = DomHelper.bySelector("#current_time_line_task_icon_2"); // 任务3图标
	current_time_line_task_icon_3 = DomHelper.bySelector("#current_time_line_task_icon_3"); // 任务4图标
	current_time_line_task_arrow_0 = DomHelper.bySelector("#current_time_line_task_arrow_0"); // 任务1箭头
	current_time_line_task_arrow_1 = DomHelper.bySelector("#current_time_line_task_arrow_1"); // 任务2箭头
	current_time_line_task_arrow_2 = DomHelper.bySelector("#current_time_line_task_arrow_2"); // 任务3箭头
	current_time_line_task_arrow_3 = DomHelper.bySelector("#current_time_line_task_arrow_3"); // 任务4箭头
	current_time_line_task_label_0 = DomHelper.bySelector("#current_time_line_task_label_0"); // 任务1标签
	current_time_line_task_label_1 = DomHelper.bySelector("#current_time_line_task_label_1"); // 任务2标签
	current_time_line_task_label_2 = DomHelper.bySelector("#current_time_line_task_label_2"); // 任务3标签
	current_time_line_task_label_3 = DomHelper.bySelector("#current_time_line_task_label_3"); // 任务4标签
	calendar_label = DomHelper.bySelector("#calendar_label"); // 日历月份
	calendar_table = DomHelper.bySelector("#calendar_table"); // 日历主体
	prev_month_btn = DomHelper.bySelector("#prev_month_btn"); // 查看上个月排班按钮
	next_month_btn = DomHelper.bySelector("#next_month_btn"); // 查看下个月排班按钮

	static status = {
		not_login: "未登录",
		logining: "登录中",
		login_success: "已登录",
		login_failed: "登录失败",
		unknown: "--"
	}
	static currentTaskStatus = {
		workIn: "上班打卡",
		meal: "前往用餐", 
		working: "切换标注",
		workOut: "下班打卡",
	}
	static workHourStatus = {
		working: "正在标注",
		meal: "前往用餐"
	};
	static workingStatus = {
		not_check_in: "未打卡",
		already_check_in: "已打卡",
		already_check_out: "已下班"
	};

	constructor() {
		super();
		this.bindEvents();
		this.init();
		this.updateUIElement();
	}
	bindEvents() {
		w2_login_btn.addEventListener("click", async () => {
			await W2.login();
			Global.value.w2_current_task_flag = true;
			await W2.currentTask();
			TimerScheduler.setIntervalTask(W2.currentTask.bind(this), 60 * 1000 * 60, "W2_CURRENT_TASK");
		});
		w2_relogin_btn.addEventListener("click", async () => {
			await W2.login(); // 再写一个relogin函数
		});
		w2_login_out_btn.addEventListener("click", async () => {
			await W2Request.loginOut();
			// 将UI置为默认状态
			this.w2_meal_working_status_label.innerText = W2.status.unknown;
			this.w2_meal_working_status_label.innerText = W2.status.unknown;
			calendar_label.innerText = W2.status.unknown;
			calendar_table.innerHTML = "";

			Global.config.w2.w2_login_status = W2.status.not_login;
			Global.config.w2.w2_token_check_task = false;

			TimerScheduler.stopAllTasks();
		});
		check_in_btn.addEventListener("click", async () => {
			await W2Request.checkIn();
		});
		w2_meal_working_status_btn.addEventListener("click", async () => {
			if (w2_meal_working_status_label.innerText === "正在标注") {
				await W2Request.meal();
			} else if (w2_meal_working_status_label.innerText === "前往用餐") {
				await W2Request.working();
			}
		});
		// 考勤打卡状态 -> 签到按钮 // 添加未登录逻辑
		this.check_in_btn.addEventListener("click", async () => {
			await W2Request.checkIn();
		});
		// 考勤打卡状态 -> 签退按钮
		this.check_out_btn.addEventListener("click", async () => {
			await W2Request.checkOut();
		});
		// 当前任务时间线 -> 开始任务按钮
		this.current_time_line_task_start_btn.addEventListener("click", async () => {
			Global.value.w2_current_task_flag= true,
			await W2.currentTask();
		});
		// 当前任务时间线 -> 停止任务按钮
		this.current_time_line_task_stop_btn.addEventListener("click", async () => {
			await W2.stopAllTask();
		});
		prev_month_btn.addEventListener("click", async () => {
			Global.value.month--;
			await this.calendarTask();
		});
		next_month_btn.addEventListener("click", async () => {
			Global.value.month++;
			await this.calendarTask();
		});
	}

	async updateUIElement() {
		this.tooltip.addTooltip(this.w2_login_btn, "点击登录W2账号");
		this.loginStatusTask();
		this.personalStatusTask();
		this.workingStatusTask();
		this.workHourStatusTask();
		this.currentTimeLineTask();
		this.calendarTask();
	}
	// 每三秒更新一次考勤状态和工作状态
	async personalStatusTask() {
		Global.config.w2.w2_personal_status_task = true;
		while (Global.config.w2.w2_personal_status_task) {
			if (Global.config.w2.w2_login_status === W2.status.login_success) {
				Global.config.w2.w2_personal_informat = await W2Request.getPersonalInformat();
			}
			await System.sleepSeconds(3);
		}
	}
	// 登录选项卡的状态显示
	async loginStatusTask() {
		Global.config.w2.w2_login_status_task = true;
		while (Global.config.w2.w2_login_status_task) {
			this.w2_login_status_label.innerText = Global.config.w2.w2_login_status || "--";
			await System.sleepSeconds(3);
		}
	}
	// 考勤打卡选项卡的状态显示
	async workingStatusTask() {
		Global.config.w2.w2_working_status_task = true;
		while (Global.config.w2.w2_working_status_task) {
			if (Global.config.w2.w2_login_status === W2.status.login_success){
				if (Global.config.w2.w2_personal_informat === null) {
					await System.sleepSeconds(3);
				} else if (Global.config.w2.w2_personal_informat.code === 200) {
					this.w2_check_in_out_label.innerText = W2.workingStatus[Global.config.w2.w2_personal_informat.data.working_status] || W2.status.unknown;
				} else {
					this.w2_check_in_out_label.innerText = W2.status.unknown;
				}
			} else {
				this.w2_check_in_out_label.innerText = W2.status.unknown;
			}
			await System.sleepSeconds(3);
		}
	}
	async workHourStatusTask() {
		Global.config.w2.w2_work_hour_status_task = true;
		while (Global.config.w2.w2_work_hour_status_task) {
			if (Global.config.w2.w2_login_status === W2.status.login_success) {
				if (Global.config.w2.w2_personal_informat === null) {
					await System.sleepSeconds(3);
				} else if (Global.config.w2.w2_personal_informat.code === 200) {
					this.w2_meal_working_status_label.innerText = W2.workHourStatus[Global.config.w2.w2_personal_informat.data.work_hour_status] || W2.status.unknown;
				} else {
					this.w2_meal_working_status_label.innerText = W2.status.unknown;
				}
			} else {
				this.w2_meal_working_status_label.innerText = W2.status.unknown;
			}
			await System.sleepSeconds(3);
		}
	}
	async currentTimeLineTask() {
		Global.config.w2.w2_current_task_status_task = true;
		while (Global.config.w2.w2_current_task_status_task) {
			if (Global.config.w2.w2_login_status === W2.status.login_success) {
				if (TimerScheduler.hasTask(Global.w2_TaskConfig.W2_CHECK_IN_TASK)) {
					this.current_time_line_task_turn_on_off_i.classList.replace("fa-regular", "fa-solid");
				} else {
					this.current_time_line_task_turn_on_off_i.classList.replace("fa-solid", "fa-regular");
				}
				for (let i = 0; i < 4; i++) {
					const icon = this["current_time_line_task_icon_" + i];
					const arrow = this["current_time_line_task_arrow_" + i];
					const label = this["current_time_line_task_label_" + i];
					// currentTask的值是currentTaskStatus枚举体中的键值, 由定时任务currentTask()变更
					if (label.innerText === Global.config.w2.w2_current_time_line_task_status) {
						icon.classList.replace("bg-blue-600", "bg-green-600");
						arrow.classList.replace("border-b-blue-600", "border-b-green-600");
					} else {
						icon.classList.replace("bg-green-600", "bg-blue-600");
						arrow.classList.replace("border-b-green-600", "border-b-blue-600");
					}
				}
			} else {
				this.current_time_line_task_turn_on_off_i.classList.replace("fa-solid", "fa-regular");
				for (let i = 0; i < 4; i++) {
					const icon = this["current_time_line_task_icon_" + i];
					const arrow = this["current_time_line_task_arrow_" + i];
					icon.classList.replace("bg-green-600", "bg-blue-600");
					arrow.classList.replace("border-b-green-600", "border-b-blue-600");
				}
			}
			await System.sleepSeconds(3);
		}
	}
	async calendarTask() {
		Global.config.w2.w2_calendar_container_task = true;
		while (Global.config.w2.w2_calendar_container_task) {
			let result = await W2Request.queryPersonalSchedule();
			if (Global.config.w2.w2_login_status === W2.status.login_success && result.code === 200) {
				// 日历标题实现
				calendar_label.innerText = Time.getCurrentYear() + " 年 " + Global.value.month + " 月";
				// 按钮逻辑 - 待优化
				if (Global.value.month >= Time.getCurrentMonth()) {
					this.next_month_btn.disabled = true;
					this.next_month_btn.classList.add('opacity-50');
					DomHelper.bySelectorFromParent(this.next_month_btn, "i").classList.add('text-gray-400');
				} else {
					this.next_month_btn.disabled = false;
					this.next_month_btn.classList.remove('opacity-50');
					DomHelper.bySelectorFromParent(this.next_month_btn, "i").classList.remove('text-gray-400');
				}
				if (Global.value.month <= 1) {
					this.prev_month_btn.disabled = true;
					this.next_month_btn.classList.add('opacity-50');
					DomHelper.bySelectorFromParent(this.next_month_btn, "i").classList.add('text-gray-400');
				} else {
					this.prev_month_btn.disabled = false;
					this.prev_month_btn.classList.remove('opacity-50');
					DomHelper.bySelectorFromParent(this.next_month_btn, "i").classList.add('text-gray-400');
				}
				// 日历日期实现
				// 更新日历页需要的<div>框架
				let firstWeekDay = Time.getFirstDayOfMonthWeek(result.data.column[0].date);
				let lastDate = parseInt(result.data.column[result.data.column.length - 1].date.split("-")[2]);
				let offsetToSaturday = (firstWeekDay) % 7;
				this.calendar_table.innerHTML = '';
				for (let i = 0; i < offsetToSaturday; i++) {
					const emptyDiv = document.createElement("div");
					emptyDiv.className = "py-2 rounded";
					this.calendar_table.appendChild(emptyDiv);
				}
				// 生成日历页
				for (let d = 1; d <= lastDate; d++) {
					const dateDiv = document.createElement('div');
					const current = new Date(Time.getCurrentYear(), Global.value.month - 1, d);
					dateDiv.id = `calendar_date_${d}`;
					dateDiv.className = 'py-2 rounded cursor-pointer transition-colors duration-200';
					dateDiv.textContent = d;

					// 格式化日期为 YYYY-MM-DD 格式
					// let result = await W2Request.queryCurrentMonthSchedule();
					// let lastDate = result.data.detail_data_list[0].schedule_infos["2025-10-01"]
					// console.log(lastDate);
					const formattedDate = Time.formatDate(Time.getCurrentYear(), Global.value.month, d);
					
					// 检查是否为休息日
					const daySchedule = result.data.detail_data_list[0].schedule_infos[formattedDate];
					if (daySchedule && daySchedule.schedule_conf_name === "休息") {
						// 休息日样式 - 使用API返回的颜色
						dateDiv.style.backgroundColor = '#DCEDC8';  // 明亮的浅绿色
						dateDiv.style.color = '#689F38';            // 中等绿色文字
						dateDiv.classList.add('font-semibold', 'shadow-sm');
					} else if (Time.isToday(current)) {
						// 今天但不是休息日
						dateDiv.classList.add('bg-blue-600', 'text-white', 'font-semibold', 'shadow-sm');
					} else {
						// 普通工作日
						dateDiv.classList.add('bg-gray-50', 'hover:bg-blue-100');
					}
					this.calendar_table.appendChild(dateDiv);
				}
				await System.sleepSeconds(60 * 60 * 8);
			} else {
				calendar_label.innerText = W2.status.unknown;
				calendar_table.innerHTML = "";
				await System.sleepSeconds(3);
			}
		}
	}

	async init() {
		this.tooltip = new ToolTip();
		// await W2.login();
		// 为每日任务写单独的函数出来
		// 在登录成功后禁用登录按钮 待定, 有空再看看要不要添加这个功能
		// 添加一个重新登录的按钮监听事件
		// 当前任务卡有bug, 每一次更新ui时将所有ui更新
		// this.currentTask();
		// 其他的html变量统一
	}
	// 定时任务
	static async currentTask() {
		const taskConfigs = [
			{
				start: Global.config.w2.w2_time_range_login_start,
				end: Global.config.w2.w2_time_range_login_end,
				action: async () => { 
					await W2.login() 
				},
				name: Global.w2_TaskConfig.W2_LOGIN_TASK
			},
			{
				start: Global.config.w2.w2_time_range_check_in_start,
				end: Global.config.w2.w2_time_range_check_in_end,
				action: async () => { 
					await W2Request.checkIn();
					Global.config.w2.w2_current_time_line_task_status = W2.currentTaskStatus.workIn;
				},
				name: Global.w2_TaskConfig.W2_CHECK_IN_TASK
			},
			{
				start: Global.config.w2.w2_time_range_meal_start,
				end: Global.config.w2.w2_time_range_meal_end,
				action: async () => { 
					await W2Request.meal();
					Global.config.w2.w2_current_time_line_task_status = W2.currentTaskStatus.meal;
				},
				name: Global.w2_TaskConfig.W2_MEAL_TASK
			},
			{
				start: Global.config.w2.w2_time_range_working_start,
				end: Global.config.w2.w2_time_range_working_end,
				action: async () => { 
					await W2Request.working();
					Global.config.w2.w2_current_time_line_task_status = W2.currentTaskStatus.working;
				},
				name: Global.w2_TaskConfig.W2_WORKING_TASK
			},
			{
				start: Global.config.w2.w2_time_range_check_out_start,
				end: Global.config.w2.w2_time_range_check_out_end,
				action: async () => { 
					await W2Request.checkOut();
					Global.config.w2.w2_current_time_line_task_status = W2.currentTaskStatus.workOut;
				},
				name: Global.w2_TaskConfig.W2_CHECK_OUT_TASK
			},
			{
				start: Global.config.w2.w2_time_range_login_out_start,
				end: Global.config.w2.w2_time_range_login_out_end,
				action: async () => { 
					await W2Request.loginOut(); 
				},
				name: Global.w2_TaskConfig.W2_LOGIN_OUT_TASK
			}
		];

		if (await W2.isLoginStatus()) {
			if (!await W2.isTodayOff()) {
				if (Global.value.w2_current_task_flag === true) {
					for (const config of taskConfigs) {
						TimerScheduler.setDailyTask(
							Time.getRandomTimeInRange(config.start, config.end),
							config.action,
							config.name
						);
					}
					Global.value.w2_current_task_flag = false;
				}
				this.log.log("今天是工作日, 定时任务已启动");
			} else {
				W2.stopAllTask();
				this.log.log("今天是休息日");
			}
		} else {
			W2.stopAllTask();
			this.log.log("未登录, 定时任务已停止");
		}
	}
	static async stopAllTask() {
		Object.values(Global.w2_TaskConfig).forEach(taskName => {
			TimerScheduler.stopTask(taskName);
		});
	}
	static async isLoginStatus() {
		let result = await W2Request.loginCheck();
		if (result.code === 200) {
			Global.config.w2.w2_token = result.data.token;
			return true;
		} else {
			return false;
		}
	}
	// 判断今天是否是休息日
	static async isTodayOff() {
		// 记录之前通过其他函数更改的月份
		let saveMonth = Global.value.month;
		Global.value.month = Time.getCurrentMonth();
		// 获取当前月份的排班数据
		const scheduleResult = await W2Request.queryPersonalSchedule();
		// 恢复之前记录的月份
		Global.value.month = saveMonth;
		// 检查返回数据是否有效
		if (!scheduleResult || !scheduleResult.data || 
			!scheduleResult.data.detail_data_list || 
			scheduleResult.data.detail_data_list.length === 0) {
			this.log.warn("无法获取排班数据");
			return false;
		}

		const detailData = scheduleResult.data.detail_data_list[0];
		const scheduleInfos = detailData.schedule_infos;
		
		// 获取今天的日期字符串（格式：YYYY-MM-DD）
		const today = Time.getCurrentDate('default');
		
		// 检查今天是否有排班信息
		if (!scheduleInfos[today]) {
			this.log.warn(`今天 ${today} 没有排班信息`);
			return false;
		}

		const todaySchedule = scheduleInfos[today];
		
		// 判断是否是休息日
		const isOff = todaySchedule.schedule_conf_name === "休息";
		
		return isOff;
	}
	static async getPersonalInformat() {
		let loginInformat = {
			loginStatus: null,
			workingStatus: null,
			workHourStatus: null
		};
		let getTokenResult = await W2Request.login();
		if (getTokenResult.code !== 200) {
			this.log.error("获取登录状态失败, 请检查是否登录");
			return false;
		}
		let getPersonalInformatResult = await W2Request.getPersonalInformat();
		if (getPersonalInformatResult.code !== 200) {
			this.log.error("获取工作状态失败, 请检查是否登录");
			return false;
		}
		loginInformat.loginStatus = Global.config.w2.w2_login_status;
		loginInformat.workingStatus = getPersonalInformatResult.data.working_status;
		loginInformat.workHourStatus = getPersonalInformatResult.data.work_hour_status;
		this.log.debug("登录信息: ", loginInformat);
		return loginInformat;
	}
	static async loginCheck() {
		Global.config.w2.w2_token_check_task = true; // 开启任务
		while (Global.config.w2.w2_token_check_task === true) {
			let result = await W2Request.loginCheck();
			this.log.log("result: ", result);
			if (result.code === 200) {
				Global.config.w2.w2_token = result.data.token;
				Global.config.w2.w2_login_status = W2.status.login_success;
			} else {
				this.log.error("Token失效, 请重新登录");
				Global.config.w2.w2_token_check_task = false; // 关闭任务
				Global.config.w2.w2_login_status = W2.status.login_failed;
			}
			await System.sleepSeconds(60);
		}
	}
	// 登录W2
	static async login() {
		if (await W2.isLoginStatus()) {
			Global.config.w2.w2_login_status = W2.status.login_success;
			this.log.log("W2已登录, 无需重复登录");
			W2.loginCheck();
			return;
		}
		let result;
		this.log.log("正在进行登录W2操作...");
		Global.config.w2.w2_login_status = W2.status.logining;
		result = await W2Request.getVerifyCode(); // 直接返回状态信息
		this.log.debug("getVerifyCode: ", result);
		if (result.code !== 200) {
			Global.config.w2.w2_login_status = W2.status.login_failed;
			this.log.error("获取验证码失败, 请检查账户信息");
			return;
		}
		this.log.log("验证码已发送, 等待接收");
		await System.sleepSeconds(5);
		result = await W2Request.getEmailApi();
		if (result.code !== 200) {
			Global.config.w2.w2_login_status = W2.status.login_failed;
			this.log.error("获取邮件失败, 请检查邮箱API信息");
			return;
		}
		this.log.debug("邮箱API结果: ", result);
		// Global.config.w2.w2_email_api_verify_code = result.data.data[0].content.match(new RegExp("\\d{6}", "g"))[0];
		Global.config.w2.w2_email_api_verify_code = "000000";
		this.log.log("正在登录");
		await W2Request.login();
		this.log.log("获取心跳");
		await W2Request.loginCheck();
		W2.loginCheck();
		this.log.log("心跳正常, 登录成功");
	}
}
class LS extends Page {
	constructor() {
		super();
		// this.bindEvents();
		// this.init();
		// this.updateUIElement();
	}
	async login() {
		// 从这里继续, 写ls的登录逻辑
	}
}
class Setting extends Page {
	btn_save_settings = DomHelper.bySelector("#btn_save_settings"); // 保存设置按钮
	// W2账号设置
	w2_user_test_account_setting_button = DomHelper.bySelector("#w2_user_test_account_setting_button"); // W2账号测试按钮
	w2_user_name_account_setting_input = DomHelper.bySelector("#w2_user_name_account_setting_input"); // W2账号输入框 账号
	w2_user_password_account_setting_input = DomHelper.bySelector("#w2_user_password_account_setting_input"); // W2密码输入框
	w2_email_api_test_account_setting_button = DomHelper.bySelector("#w2_email_api_test_account_setting_button"); // W2API测试按钮
	w2_email_api_id_account_setting_input = DomHelper.bySelector("#w2_email_api_id_account_setting_input"); // W2邮箱API输入框
	w2_email_api_secret_account_setting_input = DomHelper.bySelector("#w2_email_api_secret_account_setting_input"); // W2邮箱API密钥输入框
	w2_email_api_address_account_setting_input = DomHelper.bySelector("#w2_email_api_address_account_setting_input"); // W2邮箱输入框
	w2_email_api_pop3_auth_code_account_setting_input = DomHelper.bySelector("#w2_email_api_pop3_auth_code_account_setting_input"); // W2POP3授权码输入框
	w2_error_account_setting_message_box = DomHelper.bySelector("#w2_error_account_setting_message_box") // W2错误提示
	w2_info_account_setting_message_box = DomHelper.bySelector("#w2_info_account_setting_message_box"); // W2提示信息
	// W2模块设置
	w2_time_range_validate_format_module_setting_button = DomHelper.bySelector("#w2_time_range_validate_format_module_setting_button"); // W2验证格式按钮
	w2_time_range_login_start_module_setting_input = DomHelper.bySelector("#w2_time_range_login_start_module_setting_input"); // W2登录时间段开始输入框
	w2_time_range_login_end_module_setting_input = DomHelper.bySelector("#w2_time_range_login_end_module_setting_input"); // W2登录时间段结束输入框
	w2_time_range_login_out_start_module_setting_input = DomHelper.bySelector("#w2_time_range_login_out_start_module_setting_input"); // W2登出时间段开始输入框
	w2_time_range_login_out_end_module_setting_input = DomHelper.bySelector("#w2_time_range_login_out_end_module_setting_input"); // W2登出时间段结束输入框
	w2_time_range_check_in_start_module_setting_input = DomHelper.bySelector("#w2_time_range_check_in_start_module_setting_input"); // W2上班时间段开始输入框
	w2_time_range_check_in_end_module_setting_input = DomHelper.bySelector("#w2_time_range_check_in_end_module_setting_input"); // W2上班时间段结束输入框
	w2_time_range_check_out_start_module_setting_input = DomHelper.bySelector("#w2_time_range_check_out_start_module_setting_input"); // W2下班时间段开始输入框
	w2_time_range_check_out_end_module_setting_input = DomHelper.bySelector("#w2_time_range_check_out_end_module_setting_input"); // W2下班时间段结束输入框
	w2_time_range_meal_start_module_setting_input = DomHelper.bySelector("#w2_time_range_meal_start_module_setting_input"); // W2吃饭时间段开始输入框
	w2_time_range_meal_end_module_setting_input = DomHelper.bySelector("#w2_time_range_meal_end_module_setting_input"); // W2吃饭时间段结束输入框
	w2_time_range_working_start_module_setting_input = DomHelper.bySelector("#w2_time_range_working_start_module_setting_input"); // W2工作时间段开始输入框
	w2_time_range_working_end_module_setting_input = DomHelper.bySelector("#w2_time_range_working_end_module_setting_input"); // W2工作时间段结束输入框
	w2_error_setting_message_box = DomHelper.bySelector("#w2_error_setting_message_box"); // W2高级设置错误提示
	w2_info_setting_message_box = DomHelper.bySelector("#w2_info_setting_message_box"); // W2高级设置提示信息
	// LS账号设置
	ls_user_test_account_setting_button = DomHelper.bySelector("#ls_user_test_account_setting_button"); // LS账号测试按钮
	ls_user_name_account_setting_input = DomHelper.bySelector("#ls_user_name_account_setting_input"); // LS账号输入框 账号
	ls_user_password_account_setting_input = DomHelper.bySelector("#ls_user_password_account_setting_input"); // LS密码输入框
	ls_info_account_setting_message_box = DomHelper.bySelector("#ls_info_account_setting_message_box"); // LS提示信息
	ls_error_account_setting_message_box = DomHelper.bySelector("#ls_error_account_setting_message_box"); // LS错误提示


	constructor() {
		super();
		this.bindEvents();
		this.updateUIElement();
		this.init();
	}
	bindEvents() {
		if (DomHelper.exists(this.btn_save_settings)) {
			this.btn_save_settings.addEventListener("click", async () => {
				Global.config.w2.w2_user_name = this.w2_user_name_account_setting_input.value;
				Global.config.w2.w2_user_password = this.w2_user_password_account_setting_input.value;
				let result = await W2Request.getVerifyCode();
				if (result === 200) {
					this.w2_user_name_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					this.w2_user_password_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					this.w2_info_account_setting_message_box.classList.remove('hidden');
					this.w2_user_name_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					this.w2_user_password_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					this.w2_error_account_setting_message_box.classList.add('hidden');
				} else {
					this.w2_error_account_setting_message_box.classList.remove('hidden');
					this.w2_user_name_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					this.w2_user_password_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					this.w2_user_name_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					this.w2_user_password_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					this.w2_info_account_setting_message_box.classList.add('hidden');
					Global.config.w2.w2_user_name = null;
					Global.config.w2.w2_user_password = null;
				}
			});
		}
		if (DomHelper.exists(this.w2_user_test_account_setting_button)) {
			this.w2_user_test_account_setting_button.addEventListener("click", async () => {
				Global.config.w2.w2_user_name = this.w2_user_name_account_setting_input.value;
				Global.config.w2.w2_user_password = this.w2_user_password_account_setting_input.value;
				let result = await W2Request.getVerifyCode(); // 直接返回状态信息
				this.log.debug("getVerifyCode: ", result);
				if (result.code === 200) {
					w2_info_account_setting_message_box.querySelector("span").innerText = "W2连通性测试无误, 已为邮箱发送验证码";
					w2_user_name_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					w2_user_password_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					w2_info_account_setting_message_box.classList.remove('hidden');
					w2_user_name_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					w2_user_password_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					w2_error_account_setting_message_box.classList.add('hidden');
					Global.config.w2.w2_user_name = this.w2_user_name_account_setting_input.value;
					Global.config.w2.w2_user_password = this.w2_user_password_account_setting_input.value;
				} else if (result === 5000) {
					w2_error_account_setting_message_box.querySelector("span").innerText = "W2账号信息错误";
					w2_error_account_setting_message_box.classList.remove('hidden');
					w2_user_name_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_user_password_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_user_name_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					w2_user_password_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					w2_info_account_setting_message_box.classList.add('hidden');
					Global.config.w2.w2_user_name = null;
					Global.config.w2.w2_user_password = null;
				} else {
					w2_error_account_setting_message_box.querySelector("span").innerText = "其他未知错误, 请重试";
					w2_error_account_setting_message_box.classList.remove('hidden');
					w2_user_name_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_user_password_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_user_name_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					w2_user_password_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					w2_info_account_setting_message_box.classList.add('hidden');
					Global.config.w2.w2_user_name = null;
					Global.config.w2.w2_user_password = null;
				}
			});
		}
		if (DomHelper.exists(this.w2_email_api_test_account_setting_button)) {
			this.w2_email_api_test_account_setting_button.addEventListener("click", async () => {
				Global.config.w2.w2_email_api_id = this.w2_email_api_id_account_setting_input.value;
				Global.config.w2.w2_email_api_secret = this.w2_email_api_secret_account_setting_input.value;
				Global.config.w2.w2_email_api_address = this.w2_email_api_address_account_setting_input.value;
				Global.config.w2.w2_email_api_pop3_auth_code = this.w2_email_api_pop3_auth_code_account_setting_input.value;
				let result = await W2Request.getEmailApi(); // 返回结果
				if (result.code === 200) {
					w2_info_account_setting_message_box.querySelector("span").innerText = "W2邮箱API连通性测试无误, 已获取邮箱列表";
					w2_email_api_id_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					w2_email_api_secret_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					w2_email_api_address_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					w2_email_api_pop3_auth_code_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					
					w2_email_api_id_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					w2_email_api_secret_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					w2_email_api_address_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					w2_email_api_pop3_auth_code_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');

					w2_info_account_setting_message_box.classList.remove('hidden');
					w2_error_account_setting_message_box.classList.add('hidden');

					Global.config.w2.w2_email_api_id = this.w2_email_api_id_account_setting_input.value;
					Global.config.w2.w2_email_api_secret = this.w2_email_api_secret_account_setting_input.value;
					Global.config.w2.w2_email_api_address = this.w2_email_api_address_account_setting_input.value;
					Global.config.w2.w2_email_api_pop3_auth_code = this.w2_email_api_pop3_auth_code_account_setting_input.value;
				} else {
					w2_error_account_setting_message_box.querySelector("span").innerText = "错误代码: " + result.code + " " + result.msg;

					w2_email_api_id_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_email_api_secret_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_email_api_address_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_email_api_pop3_auth_code_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');

					w2_email_api_id_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					w2_email_api_secret_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					w2_email_api_address_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					w2_email_api_pop3_auth_code_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');

					w2_error_account_setting_message_box.classList.remove('hidden');
					w2_info_account_setting_message_box.classList.add('hidden');

					Global.config.w2.w2_email_api_id = null;
					Global.config.w2.w2_email_api_secret = null;
					Global.config.w2.w2_email_api_address = null;
					Global.config.w2.w2_email_api_pop3_auth_code = null;
				}
			});
		}
		this.w2_time_range_validate_format_module_setting_button.addEventListener("click", async () => {
			// 做一个校验, 格式是否正确
			// 获取所有时间值
			const timeFields = [
				{
					start: this.w2_time_range_login_start_module_setting_input.value,
					end: this.w2_time_range_login_end_module_setting_input.value,
					configStart: 'w2_time_range_login_start',
					configEnd: 'w2_time_range_login_end',
					fieldName: '登录',
					startInput: this.w2_time_range_login_start_module_setting_input,
					endInput: this.w2_time_range_login_end_module_setting_input
				},
				{
					start: this.w2_time_range_login_out_start_module_setting_input.value,
					end: this.w2_time_range_login_out_end_module_setting_input.value,
					configStart: 'w2_time_range_login_out_start',
					configEnd: 'w2_time_range_login_out_end',
					fieldName: '退出登录',
					startInput: this.w2_time_range_login_out_start_module_setting_input,
					endInput: this.w2_time_range_login_out_end_module_setting_input
				},
				{
					start: this.w2_time_range_check_in_start_module_setting_input.value,
					end: this.w2_time_range_check_in_end_module_setting_input.value,
					configStart: 'w2_time_range_check_in_start',
					configEnd: 'w2_time_range_check_in_end',
					fieldName: '上班打卡',
					startInput: this.w2_time_range_check_in_start_module_setting_input,
					endInput: this.w2_time_range_check_in_end_module_setting_input
				},
				{
					start: this.w2_time_range_check_out_start_module_setting_input.value,
					end: this.w2_time_range_check_out_end_module_setting_input.value,
					configStart: 'w2_time_range_check_out_start',
					configEnd: 'w2_time_range_check_out_end',
					fieldName: '下班打卡',
					startInput: this.w2_time_range_check_out_start_module_setting_input,
					endInput: this.w2_time_range_check_out_end_module_setting_input
				},
				{
					start: this.w2_time_range_meal_start_module_setting_input.value,
					end: this.w2_time_range_meal_end_module_setting_input.value,
					configStart: 'w2_time_range_meal_start',
					configEnd: 'w2_time_range_meal_end',
					fieldName: '前往用餐',
					startInput: this.w2_time_range_meal_start_module_setting_input,
					endInput: this.w2_time_range_meal_end_module_setting_input
				},
				{
					start: this.w2_time_range_working_start_module_setting_input.value,
					end: this.w2_time_range_working_end_module_setting_input.value,
					configStart: 'w2_time_range_working_start',
					configEnd: 'w2_time_range_working_end',
					fieldName: '切换标注',
					startInput: this.w2_time_range_working_start_module_setting_input,
					endInput: this.w2_time_range_working_end_module_setting_input
				}
			];
			
			// 将时间字符串转换为秒数进行比较的函数
			function timeToSeconds(timeStr) {
				const parts = timeStr.split(':');
				if (parts.length !== 3) return 0;
				return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
			}
			
			// 循环检查所有时间字段
			for (const field of timeFields) {
				if (timeToSeconds(field.start) > timeToSeconds(field.end)) {
					DomHelper.bySelectorFromParent(w2_error_setting_message_box, "span").innerText = field.fieldName + " 开始时间不能晚于结束时间";
					w2_error_setting_message_box.classList.remove("hidden");
					w2_info_setting_message_box.classList.add("hidden");
					field.startInput.classList.add("border-red-500");
					field.endInput.classList.add("border-red-500");
					return;
				} else {
					field.startInput.classList.remove("border-red-500");
					field.endInput.classList.remove("border-red-500");
				}
			}
			
			// 如果没有错误, 保存配置
			for (const field of timeFields) {
				Global.config.w2[field.configStart] = field.start;
				Global.config.w2[field.configEnd] = field.end;
			}
			// w2_info_account_setting_message_box.querySelector("span").innerText = "W2连通性测试无误, 已为邮箱发送验证码";
			DomHelper.bySelectorFromParent(w2_info_setting_message_box, "span").innerText = "时间段配置已保存";
			w2_info_setting_message_box.classList.remove("hidden");
			w2_error_setting_message_box.classList.add("hidden");
			// 重新开始任务
			Global.value.w2_current_task_flag = true;
			await W2.currentTask();
		});
		this.ls_user_test_account_setting_button.addEventListener("click", async () => {
			Global.config.ls.ls_user_name = this.ls_user_name_account_setting_input.value;
			Global.config.ls.ls_user_password = this.ls_user_password_account_setting_input.value;
	
			let result = await LSRequest.login(); // 返回结果
			if (result.code === 200) {
				ls_info_account_setting_message_box.querySelector("span").innerText = "LS连通性测试无误";
				ls_user_name_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
				ls_user_password_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
				
				
				ls_user_name_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
				ls_user_password_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
				

				ls_info_account_setting_message_box.classList.remove('hidden');
				ls_error_account_setting_message_box.classList.add('hidden');

				Global.config.ls.ls_user_name = this.ls_user_name_account_setting_input.value;
				Global.config.ls.ls_user_password = this.ls_user_password_account_setting_input.value;
			} else {
				ls_error_account_setting_message_box.querySelector("span").innerText = "错误代码: " + result.code + " " + result.msg;

				ls_user_name_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
				ls_user_password_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');

				ls_user_name_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
				ls_user_password_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');

				ls_error_account_setting_message_box.classList.remove('hidden');
				ls_info_account_setting_message_box.classList.add('hidden');

				Global.config.ls.ls_user_name = null;
				Global.config.ls.ls_user_password = null;
			}
		})
	}
	updateUIElement() {
		if (Global.config.w2.w2_user_name !== null && Global.config.w2.w2_user_password !== null) {
			this.w2_user_name_account_setting_input.value = Global.config.w2.w2_user_name;
			this.w2_user_password_account_setting_input.value = Global.config.w2.w2_user_password;
		}
		if (Global.config.w2.w2_email_api_id !== null && 
			Global.config.w2.w2_email_api_secret !== null &&
		 	Global.config.w2.w2_email_api_address !== null && 
		 	Global.config.w2.w2_email_api_pop3_auth_code !== null) {
			this.w2_email_api_id_account_setting_input.value = Global.config.w2.w2_email_api_id;
			this.w2_email_api_secret_account_setting_input.value = Global.config.w2.w2_email_api_secret;
			this.w2_email_api_address_account_setting_input.value = Global.config.w2.w2_email_api_address;
			this.w2_email_api_pop3_auth_code_account_setting_input.value = Global.config.w2.w2_email_api_pop3_auth_code;
		}
		if (Global.config.w2.w2_time_range_login_start !== null && Global.config.w2.w2_time_range_login_end !== null) {
			this.w2_time_range_login_start_module_setting_input.value = Global.config.w2.w2_time_range_login_start;
			this.w2_time_range_login_end_module_setting_input.value = Global.config.w2.w2_time_range_login_end;
		}
		if (Global.config.w2.w2_time_range_login_out_start !== null && Global.config.w2.w2_time_range_login_out_end !== null) {
			this.w2_time_range_login_out_start_module_setting_input.value = Global.config.w2.w2_time_range_login_out_start;
			this.w2_time_range_login_out_end_module_setting_input.value = Global.config.w2.w2_time_range_login_out_end;
		}
		if (Global.config.w2.w2_time_range_check_in_start !== null && Global.config.w2.w2_time_range_check_in_end !== null) {
			this.w2_time_range_check_in_start_module_setting_input.value = Global.config.w2.w2_time_range_check_in_start;
			this.w2_time_range_check_in_end_module_setting_input.value = Global.config.w2.w2_time_range_check_in_end;
		}
		if (Global.config.w2.w2_time_range_check_out_start !== null && Global.config.w2.w2_time_range_check_out_end !== null) {
			this.w2_time_range_check_out_start_module_setting_input.value = Global.config.w2.w2_time_range_check_out_start;
			this.w2_time_range_check_out_end_module_setting_input.value = Global.config.w2.w2_time_range_check_out_end;
		} 
		if (Global.config.w2.w2_time_range_meal_start !== null && Global.config.w2.w2_time_range_meal_end !== null) {
			this.w2_time_range_meal_start_module_setting_input.value = Global.config.w2.w2_time_range_meal_start;
			this.w2_time_range_meal_end_module_setting_input.value = Global.config.w2.w2_time_range_meal_end;
		}
		if (Global.config.w2.w2_time_range_working_start !== null && Global.config.w2.w2_time_range_working_end !== null) {
			this.w2_time_range_working_start_module_setting_input.value = Global.config.w2.w2_time_range_working_start;
			this.w2_time_range_working_end_module_setting_input.value = Global.config.w2.w2_time_range_working_end;
		}
		if (Global.config.ls.ls_user_name !== null && Global.config.ls.ls_user_password !== null) {
			this.ls_user_name_account_setting_input.value = Global.config.ls.ls_user_name;
			this.ls_user_password_account_setting_input.value = Global.config.ls.ls_user_password;
		}
	}
	init() {
		
	}
}