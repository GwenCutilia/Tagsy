// 
class Page {
	// 静态属性: 日志和路由配置
	static log = new Logger("Page");
	static routes = {
		"Index.html": () => new Index(),
		"W2.html": () => new W2(),
		"LS.html": () => new LS(),
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
				Global.config.system.status = false;
				await LoadGlobalAllScripts();
				Resource.AllLoaded();
				DomHelper.bySelector(this.loadingStatusValueID).innerText = "已加载";
			});
		}
		if (DomHelper.exists(this.btnUnloadID)) {
			DomHelper.bySelector(this.btnUnloadID).addEventListener("click", () => {
				Global.config.system.status = false;
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
		if (Global.config.w2.user_name === null) {
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
	login_status_label = DomHelper.bySelector("#login_status_label"); // 登录状态
	check_in_out_label = DomHelper.bySelector("#check_in_out_label"); // 考勤打卡状态
	meal_working_status_label = DomHelper.bySelector("#meal_working_status_label"); // 工作状态
	login_btn = DomHelper.bySelector("#login_btn"); // 登录按钮
	relogin_btn = DomHelper.bySelector("#relogin_btn"); // 重新登录按钮
	login_out_btn = DomHelper.bySelector("#login_out_btn"); // 退出登录按钮
	check_in_btn = DomHelper.bySelector("#check_in_btn"); // 打卡按钮
	check_out_btn = DomHelper.bySelector("#check_out_btn"); // 下班按钮
	meal_working_status_btn = DomHelper.bySelector("#meal_working_status_btn"); // 切换状态按钮
	current_time_line_task_start_btn = DomHelper.bySelector("#current_time_line_task_start_btn"); // 开始W2任务按钮
	current_time_line_task_stop_btn = DomHelper.bySelector("#current_time_line_task_stop_btn"); // 停止W2任务按钮
	current_time_line_task_turn_on_off_i = DomHelper.bySelector("#current_time_line_task_turn_on_off_i"); // 任务开关图标
	// 更改图标
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
		this.init();
		this.bindEvents();
		this.updateUIElement();
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
	// 登录W2
	static async login() {
		if (await W2.isLoginStatus()) {
			Global.config.w2.login_status = W2.status.login_success;
			this.log.log("W2已登录, 无需重复登录");
			W2.loginCheck();
			return;
		}
		let result;
		this.log.log("正在进行登录W2操作...");
		Global.config.w2.login_status = W2.status.logining;
		result = await W2Request.getVerifyCode(); // 直接返回状态信息
		this.log.debug("getVerifyCode: ", result);
		if (result.code !== 200) {
			Global.config.w2.login_status = W2.status.login_failed;
			this.log.error("获取验证码失败, 请检查账户信息");
			return;
		}
		this.log.log("验证码已发送, 等待接收");
		await System.sleepSeconds(5);
		result = await W2Request.getEmailApi();
		if (result.code !== 200) {
			Global.config.w2.login_status = W2.status.login_failed;
			this.log.error("获取邮件失败, 请检查邮箱API信息");
			return;
		}
		this.log.debug("邮箱API结果: ", result);
		// Global.config.w2.email_api_verify_code = result.data.data[0].content.match(new RegExp("\\d{6}", "g"))[0];
		Global.config.w2.email_api_verify_code = "000000";
		this.log.log("正在登录");
		await W2Request.login();
		this.log.log("获取心跳");
		await W2Request.loginCheck();
		W2.loginCheck();
		this.log.log("心跳正常, 登录成功");
	}
	// 查询是否是登录状态
	static async isLoginStatus() {
		let result = await W2Request.loginCheck();
		if (result.code === 200) {
			Global.config.w2.token = result.data.token;
			return true;
		} else {
			return false;
		}
	}
	// 心跳
	static async loginCheck() {
		Global.config.w2.token_check_task = true; // 开启任务
		while (Global.config.w2.token_check_task === true) {
			let result = await W2Request.loginCheck();
			this.log.log("result: ", result);
			if (result.code === 200) {
				Global.config.w2.token = result.data.token;
				Global.config.w2.login_status = W2.status.login_success;
			} else {
				this.log.error("Token失效, 请重新登录");
				Global.config.w2.token_check_task = false; // 关闭任务
				Global.config.w2.login_status = W2.status.login_failed;
			}
			await System.sleepSeconds(60);
		}
	}
	bindEvents() {
		login_btn.addEventListener("click", async () => {
			await W2.login();
			Global.value.w2_current_task_flag = true;
			await W2.currentTask();
			TimerScheduler.setIntervalTask(W2.currentTask.bind(this), 60 * 1000 * 60, "W2_CURRENT_TASK");
		});
		relogin_btn.addEventListener("click", async () => {
			await W2.login(); // 再写一个relogin函数
		});
		login_out_btn.addEventListener("click", async () => {
			await W2Request.loginOut();
			// 将UI置为默认状态
			this.check_in_out_label.innerText = W2.status.unknown;
			this.meal_working_status_label.innerText = W2.status.unknown;
			this.calendar_label.innerText = W2.status.unknown;
			this.calendar_table.innerHTML = "";

			Global.config.w2.login_status = W2.status.not_login;
			Global.config.w2.token_check_task = false;

			W2.stopAllTask();
		});
		check_in_btn.addEventListener("click", async () => {
			await W2Request.checkIn();
		});
		meal_working_status_btn.addEventListener("click", async () => {
			if (meal_working_status_label.innerText === "正在标注") {
				await W2Request.meal();
			} else if (meal_working_status_label.innerText === "前往用餐") {
				await W2Request.working();
			}
		});
		// 考勤打卡状态 -> 签到按钮 // 添加未登录逻辑
		this.check_in_btn.addEventListener("click", async () => {
			await W2Request.checkIn();
		});
		// 考勤打卡状态 -> 签出按钮
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
		this.addTooltipMessage();
		TimerScheduler.setIntervalTask(async () => { this.personalStatusTask() }, 3000, "W2_PERSONAL_STATUS_TASK");
		TimerScheduler.setIntervalTask(async () => { this.loginStatusTask() }, 3000, "W2_LOGIN_STATUS_TASK");
		TimerScheduler.setIntervalTask(async () => { this.workingStatusTask() }, 3000, "W2_WORKING_STATUS_TASK");
		TimerScheduler.setIntervalTask(async () => { this.workHourStatusTask() }, 3000, "W2_WORK_HOUR_STATUS_TASK");
		TimerScheduler.setIntervalTask(async () => { this.currentTimeLineTask() }, 3000, "W2_CURRENT_TIME_LINE_TASK");
		TimerScheduler.setIntervalTask(async () => { this.calendarTask() }, 10 * 1000, "W2_CALENDAR_TASK");
	}
	// 获取工作信息
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
		loginInformat.loginStatus = Global.config.w2.login_status;
		loginInformat.workingStatus = getPersonalInformatResult.data.working_status;
		loginInformat.workHourStatus = getPersonalInformatResult.data.work_hour_status;
		this.log.debug("登录信息: ", loginInformat);
		return loginInformat;
	}
	// 常驻的提示栏
	async addTooltipMessage() {
		this.tooltip.addTooltip(this.login_btn, "进行登录");
		this.tooltip.addTooltip(this.relogin_btn, "重新进行登录");
		this.tooltip.addTooltip(this.login_out_btn, "进行手动退出登录");
		this.tooltip.addTooltip(this.check_in_btn, "签到(按设置中的上班时间段签到)");
		this.tooltip.addTooltip(this.check_out_btn, "签出(按设置中的下班时间段签出)");
		this.tooltip.addTooltip(this.meal_working_status_btn, "切换状态(可能会延迟几秒)");
		this.tooltip.addTooltip(this.current_time_line_task_turn_on_off_i, "亮起代表任务正常运行");
		this.tooltip.addTooltip(this.current_time_line_task_start_btn, "启动任务");
		this.tooltip.addTooltip(this.current_time_line_task_stop_btn, "停止任务");
		this.tooltip.addTooltip(this.prev_month_btn, "查看上个月排班");
		this.tooltip.addTooltip(this.next_month_btn, "查看下个月排班");
	}
	// 每三秒更新一次考勤状态和工作状态
	async personalStatusTask() {
		if (Global.config.w2.login_status === W2.status.login_success) {
			Global.config.w2.personal_informat = await W2Request.getPersonalInformat();
		}
	}
	// 登录选项卡的状态显示
	async loginStatusTask() {
		this.login_status_label.innerText = Global.config.w2.login_status || "--";
	}
	// 考勤打卡选项卡的状态显示
	async workingStatusTask() {
		if (Global.config.w2.login_status === W2.status.login_success){
			if (Global.config.w2.personal_informat === null) {
				
			} else if (Global.config.w2.personal_informat.code === 200) {
				this.check_in_out_label.innerText = W2.workingStatus[Global.config.w2.personal_informat.data.working_status] || W2.status.unknown;
			} else {
				this.check_in_out_label.innerText = W2.status.unknown;
			}
		} else {
			this.check_in_out_label.innerText = W2.status.unknown;
		}
	}
	async workHourStatusTask() {
		if (Global.config.w2.login_status === W2.status.login_success) {
			if (Global.config.w2.personal_informat === null) {

			} else if (Global.config.w2.personal_informat.code === 200) {
				this.meal_working_status_label.innerText = W2.workHourStatus[Global.config.w2.personal_informat.data.work_hour_status] || W2.status.unknown;
			} else {
				this.meal_working_status_label.innerText = W2.status.unknown;
			}
		} else {
			this.meal_working_status_label.innerText = W2.status.unknown;
		}
	}
	async currentTimeLineTask() {
		if (Global.config.w2.login_status === W2.status.login_success) {
			if (TimerScheduler.hasTask(Global.w2_TaskConfig.W2_CHECK_IN_TASK)) {
				this.current_time_line_task_turn_on_off_i.classList.replace("fa-regular", "fa-solid");
			} else {
				this.current_time_line_task_turn_on_off_i.classList.replace("fa-solid", "fa-regular");
			}
			for (let i = 0; i < 4; i++) {
				const icon = this["current_time_line_task_icon_" + i];
				const arrow = this["current_time_line_task_arrow_" + i];
				const label = this["current_time_line_task_label_" + i];
				// currentTask的值是currentTaskStatus枚举体中的键值, 由间隔任务currentTask()变更
				if (label.innerText === Global.config.w2.current_time_line_task_status) {
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
	// 我的排班日历
	async calendarTask() {
		let result = await W2Request.queryPersonalSchedule();
		if (Global.config.w2.login_status === W2.status.login_success && result.code === 200) {
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
					this.tooltip.addTooltip(dateDiv, "休息日");
				} else if (Time.isToday(current)) {
					// 今天但不是休息日
					dateDiv.classList.add('bg-blue-600', 'text-white', 'font-semibold', 'shadow-sm');
					this.tooltip.addTooltip(dateDiv, "这是今天");
				} else {
					// 普通工作日
					dateDiv.classList.add('bg-gray-50', 'hover:bg-blue-100');
				}
				this.calendar_table.appendChild(dateDiv);
			}
		} else {
			calendar_label.innerText = W2.status.unknown;
			calendar_table.innerHTML = "";
		}
	}
	// 定时任务
	static async currentTask() {
		const taskConfigs = [
			{
				start: Global.config.w2.time_range_login_start,
				end: Global.config.w2.time_range_login_end,
				action: async () => { 
					await W2.login() 
				},
				name: Global.w2_TaskConfig.W2_LOGIN_TASK
			},
			{
				start: Global.config.w2.time_range_check_in_start,
				end: Global.config.w2.time_range_check_in_end,
				action: async () => { 
					await W2Request.checkIn();
					Global.config.w2.current_time_line_task_status = W2.currentTaskStatus.workIn;
				},
				name: Global.w2_TaskConfig.W2_CHECK_IN_TASK
			},
			{
				start: Global.config.w2.time_range_meal_start,
				end: Global.config.w2.time_range_meal_end,
				action: async () => { 
					await W2Request.meal();
					Global.config.w2.current_time_line_task_status = W2.currentTaskStatus.meal;
				},
				name: Global.w2_TaskConfig.W2_MEAL_TASK
			},
			{
				start: Global.config.w2.time_range_working_start,
				end: Global.config.w2.time_range_working_end,
				action: async () => { 
					await W2Request.working();
					Global.config.w2.current_time_line_task_status = W2.currentTaskStatus.working;
				},
				name: Global.w2_TaskConfig.W2_WORKING_TASK
			},
			{
				start: Global.config.w2.time_range_check_out_start,
				end: Global.config.w2.time_range_check_out_end,
				action: async () => { 
					await W2Request.checkOut();
					Global.config.w2.current_time_line_task_status = W2.currentTaskStatus.workOut;
				},
				name: Global.w2_TaskConfig.W2_CHECK_OUT_TASK
			},
			{
				start: Global.config.w2.time_range_login_out_start,
				end: Global.config.w2.time_range_login_out_end,
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
	// 停止所有W2时间线任务
	static async stopAllTask() {
		Object.values(Global.w2_TaskConfig).forEach(taskName => {
			TimerScheduler.stopTask(taskName);
		});
	}

}
class LS extends Page {
	login_status_label = DomHelper.bySelector("#login_status_label"); // 签到签出标签
	fill_daily_report_label = DomHelper.bySelector("#fill_daily_report_label"); // 打卡状态标签
	daily_report_list_label = DomHelper.bySelector("#daily_report_list_label"); // 日报列表标题
	daily_report_list_table = DomHelper.bySelector("#daily_report_list_table"); // 日报列表表格

	static status = {
		login_success: "登录成功",
		login_failed: "登录失败",
		not_loginfill_daily_report: "未打卡",
		already_fill_daily_report: "已打卡",
		failed_fill_daily_report: "打卡失败", // 打卡失败
		unknown: "--"
	};

	constructor() {
		super();
		// this.bindEvents();
		this.init();
		this.updateUIElement();
	}
	async init() {
		await LS.login();
		await LS.currentTask();
	}
	// 登录
	static async login() {
		// 从这里继续, 写ls的登录逻辑
		if (Global.config.ls.user_name == null && Global.config.ls.user_password === null) {
			this.log.error("LS用户名或密码为失效");
			Global.config.ls.login_status = LS.status.login_failed;
			return;
		}
		const result = await LSRequest.login();
		if (result.code === 200) {
			this.log.log("LS登录成功");
			Global.config.ls.login_status = LS.status.login_success;
		} else {
			this.log.error("LS登录失败");
			Global.config.ls.login_status = LS.status.login_failed;
		}
		if (Global.config.ls.sub_task_id === null) {
			let result = await LSRequest.getPersonalInformat();
			if (result.code === 200) {
				this.log.log("获取项目工作区信息成功");
			} else {
				this.log.error("LS -> login() -> 获取项目工作区信息失败");
			}
		}
		if (Global.config.ls.user_id === null || Global.config.ls.task_id === null) {
			let result = await LSRequest.getInfo();
			if (result.code === 200) {
				this.log.log("获取个人信息成功");
			} else {
				this.log.error("LS -> login() -> 获取个人信息失败");
			}
		}
	}
	// 心跳 如果LS的掉线了再做
	static async loginCheck() {
		
	}
	// 填写日报
	static async fillDailyReport() {
		let result = await LSRequest.fillDailyReport();
		if (result.code === 200) {
			this.log.log("填写日报成功, 返回信息: ", result.msg);
			
		} else {
			
		}
	}
	// 刷新UI
	async updateUIElement() {
		// 登录状态UI
		TimerScheduler.setIntervalTask(async () => { this.loginStatus() }, 3000, Global.ls_TaskConfig.LS_LOGIN_STATUS_TASK);
		// 打卡任务UI
		TimerScheduler.setIntervalTask(async () => { this.fillDailyReportStatus() }, 10000, Global.ls_TaskConfig.LS_FILL_DAILY_REPORT_STATUS_TASK);
		// 日报列表UI
		TimerScheduler.setIntervalTask(async () => { this.dailyReportList() }, 10000, Global.ls_TaskConfig.LS_DAILY_REPORT_LIST_STATUS_TASK);
	}
	// 登录状态刷新
	async loginStatus() {
		this.login_status_label.innerText = Global.config.ls.login_status;
	}
	// 日报打卡状态
	async fillDailyReportStatus() {
		// 如果检测到当天的记录, 就更新打卡成功
		let result = await LSRequest.getDailyReportList();
		if (result.code === 200) {
			if (Time.isSameDay(result.rows[0].recordTime, Time.getCurrentDate())) {
				this.fill_daily_report_label.innerText = LS.status.already_fill_daily_report;
			} else {
				this.fill_daily_report_label.innerText = LS.status.not_loginfill_daily_report;
			}
		} else {
			this.fill_daily_report_label.innerText = LS.status.unknown;
		}
	}
	// 退出登录
	async loginOut() {

	}
	// 清除打卡状态
	async clearDailyReportStatus() {
		Global.config.ls.login_status = LS.status.unknown;
		Global.config.ls.fill_daily_report_status = LS.status.unknown;
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
		const taskConfigs = [
			{
				start: Global.config.ls.time_range_login_start,
				end: Global.config.ls.time_range_login_end,
				action: async () => { await LS.login() },
				name: Global.ls_TaskConfig.LS_LOGIN_TASK
			},
			{
				start: Global.config.ls.time_range_login_out_start,
				end: Global.config.ls.time_range_login_out_end,
				action: async () => { await LS.loginOut() },
				name: Global.ls_TaskConfig.LS_LOGIN_OUT_TASK
			},
			{
				start: Global.config.ls.time_range_fill_daily_report_start,
				end: Global.config.ls.time_range_fill_daily_report_end,
				action: async () => { await LS.fillDailyReport() },
				name: Global.ls_TaskConfig.LS_FILL_DAILY_REPORT_TASK
			}
		]
		if (!await W2.isTodayOff()) {
			for (const config of taskConfigs) {
				TimerScheduler.setDailyTask(
					Time.getRandomTimeInRange(config.start, config.end),
					config.action,
					config.name
				);
			}
			this.log.log("今天是工作日, 定时任务已启动");
		} else {
			// LS.stopAllTask();
			this.log.log("今天是休息日");
		}
	}
	// 日报列表
	async dailyReportList() {
		let result = await LSRequest.getDailyReportList();
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
	w2_info_setting_message_box = DomHelper.bySelector("#w2_info_setting_message_box"); // W2高级设置提示信息
	w2_error_setting_message_box = DomHelper.bySelector("#w2_error_setting_message_box"); // W2高级设置错误提示
	// LS账号设置
	ls_user_test_account_setting_button = DomHelper.bySelector("#ls_user_test_account_setting_button"); // LS账号测试按钮
	ls_user_name_account_setting_input = DomHelper.bySelector("#ls_user_name_account_setting_input"); // LS账号输入框 账号
	ls_user_password_account_setting_input = DomHelper.bySelector("#ls_user_password_account_setting_input"); // LS密码输入框
	ls_info_account_setting_message_box = DomHelper.bySelector("#ls_info_account_setting_message_box"); // LS提示信息
	ls_error_account_setting_message_box = DomHelper.bySelector("#ls_error_account_setting_message_box"); // LS错误提示
	// LS模块设置
	ls_time_range_login_start_module_setting_input = DomHelper.bySelector("#ls_time_range_login_start_module_setting_input");
	ls_time_range_login_end_module_setting_input = DomHelper.bySelector("#ls_time_range_login_end_module_setting_input");
	ls_time_range_login_out_start_module_setting_input = DomHelper.bySelector("#ls_time_range_login_out_start_module_setting_input");
	ls_time_range_login_out_end_module_setting_input = DomHelper.bySelector("#ls_time_range_login_out_end_module_setting_input");
	ls_time_range_fill_daily_report_start_module_setting_input = DomHelper.bySelector("#ls_time_range_fill_daily_report_start_module_setting_input");
	ls_time_range_fill_daily_report_end_module_setting_input = DomHelper.bySelector("#ls_time_range_fill_daily_report_end_module_setting_input");
	ls_info_setting_message_box = DomHelper.bySelector("#ls_info_setting_message_box");
	ls_error_setting_message_box = DomHelper.bySelector("#ls_error_setting_message_box");

	constructor() {
		super();
		this.bindEvents();
		this.updateUIElement();
		this.init();
	}
	bindEvents() {
		if (DomHelper.exists(this.btn_save_settings)) {
			this.btn_save_settings.addEventListener("click", async () => {
				Global.config.w2.user_name = this.w2_user_name_account_setting_input.value;
				Global.config.w2.user_password = this.w2_user_password_account_setting_input.value;
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
					Global.config.w2.user_name = null;
					Global.config.w2.user_password = null;
				}
			});
		}
		if (DomHelper.exists(this.w2_user_test_account_setting_button)) {
			this.w2_user_test_account_setting_button.addEventListener("click", async () => {
				Global.config.w2.user_name = this.w2_user_name_account_setting_input.value;
				Global.config.w2.user_password = this.w2_user_password_account_setting_input.value;
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
					Global.config.w2.user_name = this.w2_user_name_account_setting_input.value;
					Global.config.w2.user_password = this.w2_user_password_account_setting_input.value;
				} else if (result === 5000) {
					w2_error_account_setting_message_box.querySelector("span").innerText = "W2账号信息错误";
					w2_error_account_setting_message_box.classList.remove('hidden');
					w2_user_name_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_user_password_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_user_name_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					w2_user_password_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					w2_info_account_setting_message_box.classList.add('hidden');
					Global.config.w2.user_name = null;
					Global.config.w2.user_password = null;
				} else {
					w2_error_account_setting_message_box.querySelector("span").innerText = "其他未知错误, 请重试";
					w2_error_account_setting_message_box.classList.remove('hidden');
					w2_user_name_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_user_password_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_user_name_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					w2_user_password_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					w2_info_account_setting_message_box.classList.add('hidden');
					Global.config.w2.user_name = null;
					Global.config.w2.user_password = null;
				}
			});
		}
		if (DomHelper.exists(this.w2_email_api_test_account_setting_button)) {
			this.w2_email_api_test_account_setting_button.addEventListener("click", async () => {
				Global.config.w2.email_api_id = this.w2_email_api_id_account_setting_input.value;
				Global.config.w2.email_api_secret = this.w2_email_api_secret_account_setting_input.value;
				Global.config.w2.email_api_address = this.w2_email_api_address_account_setting_input.value;
				Global.config.w2.email_api_pop3_auth_code = this.w2_email_api_pop3_auth_code_account_setting_input.value;
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

					Global.config.w2.email_api_id = this.w2_email_api_id_account_setting_input.value;
					Global.config.w2.email_api_secret = this.w2_email_api_secret_account_setting_input.value;
					Global.config.w2.email_api_address = this.w2_email_api_address_account_setting_input.value;
					Global.config.w2.email_api_pop3_auth_code = this.w2_email_api_pop3_auth_code_account_setting_input.value;
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

					Global.config.w2.email_api_id = null;
					Global.config.w2.email_api_secret = null;
					Global.config.w2.email_api_address = null;
					Global.config.w2.email_api_pop3_auth_code = null;
				}
			});
		}
		this.ls_time_range_validate_format_module_setting_button = DomHelper.bySelector("#ls_time_range_validate_format_module_setting_button");
		this.ls_time_range_validate_format_module_setting_button.addEventListener("click", async () => {
			
			// const time_range_login_start = this.ls_time_range_login_start_module_setting_input.value;
			// const time_range_login_end = this.ls_time_range_login_end_module_setting_input.value;
			// const time_range_login_out_start = this.ls_time_range_login_out_start_module_setting_input.value;
			// const time_range_login_out_end = this.ls_time_range_login_out_end_module_setting_input.value;
			// const time_range_fill_daily_report_start = this.ls_time_range_fill_daily_report_start_module_setting_input.value;
			// const time_range_fill_daily_report_end = this.ls_time_range_fill_daily_report_end_module_setting_input.value;
			// 获取所有时间值
			const timeFields = [
				{
					start: this.ls_time_range_login_start_module_setting_input.value,
					end: this.ls_time_range_login_end_module_setting_input.value,
					configStart: 'time_range_login_start',
					configEnd: 'time_range_login_end',
					fieldName: '登录',
					startInput: this.ls_time_range_login_start_module_setting_input,
					endInput: this.ls_time_range_login_end_module_setting_input
				},
				{
					start: this.ls_time_range_login_out_start_module_setting_input.value,
					end: this.ls_time_range_login_out_end_module_setting_input.value,
					configStart: 'time_range_login_out_start',
					configEnd: 'time_range_login_out_end',
					fieldName: '退出登录',
					startInput: this.ls_time_range_login_out_start_module_setting_input,
					endInput: this.ls_time_range_login_out_end_module_setting_input
				},
				{
					start: ls_time_range_fill_daily_report_start_module_setting_input.value,
					end: ls_time_range_fill_daily_report_end_module_setting_input.value,
					configStart: 'time_range_fill_daily_report_start',
					configEnd: 'time_range_fill_daily_report_end',
					fieldName: '填报日报',
					startInput: this.ls_time_range_fill_daily_report_start_module_setting_input,
					endInput: this.ls_time_range_fill_daily_report_end_module_setting_input
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
					DomHelper.bySelectorFromParent(ls_error_setting_message_box, "span").innerText = field.fieldName + " 开始时间不能晚于结束时间";
					ls_error_setting_message_box.classList.remove("hidden");
					ls_info_setting_message_box.classList.add("hidden");
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
				Global.config.ls[field.configStart] = field.start;
				Global.config.ls[field.configEnd] = field.end;
			}
			DomHelper.bySelectorFromParent(ls_info_setting_message_box, "span").innerText = "时间段配置已保存";
			ls_info_setting_message_box.classList.remove("hidden");
			ls_error_setting_message_box.classList.add("hidden");
		});
		this.w2_time_range_validate_format_module_setting_button.addEventListener("click", async () => {
			// 获取所有时间值
			const timeFields = [
				{
					start: this.w2_time_range_login_start_module_setting_input.value,
					end: this.w2_time_range_login_end_module_setting_input.value,
					configStart: 'time_range_login_start',
					configEnd: 'time_range_login_end',
					fieldName: '登录',
					startInput: this.w2_time_range_login_start_module_setting_input,
					endInput: this.w2_time_range_login_end_module_setting_input
				},
				{
					start: this.w2_time_range_login_out_start_module_setting_input.value,
					end: this.w2_time_range_login_out_end_module_setting_input.value,
					configStart: 'time_range_login_out_start',
					configEnd: 'time_range_login_out_end',
					fieldName: '退出登录',
					startInput: this.w2_time_range_login_out_start_module_setting_input,
					endInput: this.w2_time_range_login_out_end_module_setting_input
				},
				{
					start: this.w2_time_range_check_in_start_module_setting_input.value,
					end: this.w2_time_range_check_in_end_module_setting_input.value,
					configStart: 'time_range_check_in_start',
					configEnd: 'time_range_check_in_end',
					fieldName: '上班打卡',
					startInput: this.w2_time_range_check_in_start_module_setting_input,
					endInput: this.w2_time_range_check_in_end_module_setting_input
				},
				{
					start: this.w2_time_range_check_out_start_module_setting_input.value,
					end: this.w2_time_range_check_out_end_module_setting_input.value,
					configStart: 'time_range_check_out_start',
					configEnd: 'time_range_check_out_end',
					fieldName: '下班打卡',
					startInput: this.w2_time_range_check_out_start_module_setting_input,
					endInput: this.w2_time_range_check_out_end_module_setting_input
				},
				{
					start: this.w2_time_range_meal_start_module_setting_input.value,
					end: this.w2_time_range_meal_end_module_setting_input.value,
					configStart: 'time_range_meal_start',
					configEnd: 'time_range_meal_end',
					fieldName: '前往用餐',
					startInput: this.w2_time_range_meal_start_module_setting_input,
					endInput: this.w2_time_range_meal_end_module_setting_input
				},
				{
					start: this.w2_time_range_working_start_module_setting_input.value,
					end: this.w2_time_range_working_end_module_setting_input.value,
					configStart: 'time_range_working_start',
					configEnd: 'time_range_working_end',
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
			Global.config.ls.user_name = this.ls_user_name_account_setting_input.value;
			Global.config.ls.user_password = this.ls_user_password_account_setting_input.value;
	
			let result = await LSRequest.login(); // 返回结果
			if (result.code === 200) {
				ls_info_account_setting_message_box.querySelector("span").innerText = "LS连通性测试无误";
				ls_user_name_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
				ls_user_password_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
				
				ls_user_name_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
				ls_user_password_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
				

				ls_info_account_setting_message_box.classList.remove('hidden');
				ls_error_account_setting_message_box.classList.add('hidden');

				Global.config.ls.user_name = this.ls_user_name_account_setting_input.value;
				Global.config.ls.user_password = this.ls_user_password_account_setting_input.value;
			} else {
				ls_error_account_setting_message_box.querySelector("span").innerText = "错误代码: " + result.code + " " + result.msg;

				ls_user_name_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
				ls_user_password_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');

				ls_user_name_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
				ls_user_password_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');

				ls_error_account_setting_message_box.classList.remove('hidden');
				ls_info_account_setting_message_box.classList.add('hidden');

				Global.config.ls.user_name = null;
				Global.config.ls.user_password = null;
			}
		})
	}
	updateUIElement() {
		if (Global.config.w2.user_name !== null && Global.config.w2.user_password !== null) {
			this.w2_user_name_account_setting_input.value = Global.config.w2.user_name;
			this.w2_user_password_account_setting_input.value = Global.config.w2.user_password;
		}
		if (Global.config.w2.email_api_id !== null && 
			Global.config.w2.email_api_secret !== null &&
		 	Global.config.w2.email_api_address !== null && 
		 	Global.config.w2.email_api_pop3_auth_code !== null) {
			this.w2_email_api_id_account_setting_input.value = Global.config.w2.email_api_id;
			this.w2_email_api_secret_account_setting_input.value = Global.config.w2.email_api_secret;
			this.w2_email_api_address_account_setting_input.value = Global.config.w2.email_api_address;
			this.w2_email_api_pop3_auth_code_account_setting_input.value = Global.config.w2.email_api_pop3_auth_code;
		}
		if (Global.config.w2.time_range_login_start !== null && Global.config.w2.time_range_login_end !== null) {
			this.w2_time_range_login_start_module_setting_input.value = Global.config.w2.time_range_login_start;
			this.w2_time_range_login_end_module_setting_input.value = Global.config.w2.time_range_login_end;
		}
		if (Global.config.w2.time_range_login_out_start !== null && Global.config.w2.time_range_login_out_end !== null) {
			this.w2_time_range_login_out_start_module_setting_input.value = Global.config.w2.time_range_login_out_start;
			this.w2_time_range_login_out_end_module_setting_input.value = Global.config.w2.time_range_login_out_end;
		}
		if (Global.config.w2.time_range_check_in_start !== null && Global.config.w2.time_range_check_in_end !== null) {
			this.w2_time_range_check_in_start_module_setting_input.value = Global.config.w2.time_range_check_in_start;
			this.w2_time_range_check_in_end_module_setting_input.value = Global.config.w2.time_range_check_in_end;
		}
		if (Global.config.w2.time_range_check_out_start !== null && Global.config.w2.time_range_check_out_end !== null) {
			this.w2_time_range_check_out_start_module_setting_input.value = Global.config.w2.time_range_check_out_start;
			this.w2_time_range_check_out_end_module_setting_input.value = Global.config.w2.time_range_check_out_end;
		} 
		if (Global.config.w2.time_range_meal_start !== null && Global.config.w2.time_range_meal_end !== null) {
			this.w2_time_range_meal_start_module_setting_input.value = Global.config.w2.time_range_meal_start;
			this.w2_time_range_meal_end_module_setting_input.value = Global.config.w2.time_range_meal_end;
		}
		if (Global.config.w2.time_range_working_start !== null && Global.config.w2.time_range_working_end !== null) {
			this.w2_time_range_working_start_module_setting_input.value = Global.config.w2.time_range_working_start;
			this.w2_time_range_working_end_module_setting_input.value = Global.config.w2.time_range_working_end;
		}
		if (Global.config.ls.user_name !== null && Global.config.ls.user_password !== null) {
			this.ls_user_name_account_setting_input.value = Global.config.ls.user_name;
			this.ls_user_password_account_setting_input.value = Global.config.ls.user_password;
		}
		if (Global.config.ls.time_range_login_start !== null && Global.config.ls.time_range_login_end !== null) {
			this.ls_time_range_login_start_module_setting_input.value = Global.config.ls.time_range_login_start;
			this.ls_time_range_login_end_module_setting_input.value = Global.config.ls.time_range_login_end;
		}
		if (Global.config.ls.time_range_login_out_start !== null && Global.config.ls.time_range_login_out_end !== null) {
			this.ls_time_range_login_out_start_module_setting_input.value = Global.config.ls.time_range_login_out_start;
			this.ls_time_range_login_out_end_module_setting_input.value = Global.config.ls.time_range_login_out_end;
		}
		if (Global.config.ls.time_range_fill_daily_report_start !== null && Global.config.ls.time_range_fill_daily_report_end !== null) {
			this.ls_time_range_fill_daily_report_start_module_setting_input.value = Global.config.ls.time_range_fill_daily_report_start;
			this.ls_time_range_fill_daily_report_end_module_setting_input.value = Global.config.ls.time_range_fill_daily_report_end;
		}
	}
	init() {
		
	}
}