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
	static init() {
		Template.init();
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
    static init() {
		if (!this.isTemplatePage()) {
            return;
        }
        Template.loadTask();
        this.log.log('Template初始化完成');
    }
	static async loadTask() {
		await W2Request.getLoginPage();
		W2.login();
		// 为每日任务写单独的函数出来
		// 在登录成功后禁用登录按钮 待定, 有空再看看要不要添加这个功能
		// 添加一个重新登录的按钮监听事件
		// 当前任务卡有bug, 每一次更新ui时将所有ui更新
		W2.currentTask();
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
		if (Global.config.w2.w2_user_id === null) {
			this.runtimeLog.add("W2账号未填写, 请于设置填写账号信息");
			this.runtimeLog.add("W2模块已停止运行");
			// 停止W2模块
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
	card_login_status_value = DomHelper.bySelector("#card_login_status_value"); // 登录状态
	card_working_status_value = DomHelper.bySelector("#card_working_status_value"); // 考勤打卡状态
	card_work_status_value = DomHelper.bySelector("#card_work_status_value"); // 工作状态
	card_login_btn = DomHelper.bySelector("#card_login_btn"); // 登录按钮
	card_relogin_btn = DomHelper.bySelector("#card_relogin_btn"); // 重新登录按钮
	card_login_out_btn = DomHelper.bySelector("#card_login_out_btn"); // 退出登录按钮
	card_switch_status_btn = DomHelper.bySelector("#card_switch_status_btn"); // 切换状态按钮
	task_icon_0 = DomHelper.bySelector("#task_icon_0"); // 任务1图标
	task_icon_1 = DomHelper.bySelector("#task_icon_1"); // 任务2图标
	task_icon_2 = DomHelper.bySelector("#task_icon_2"); // 任务3图标
	task_icon_3 = DomHelper.bySelector("#task_icon_3"); // 任务4图标
	task_arrow_0 = DomHelper.bySelector("#task_arrow_0"); // 任务1箭头
	task_arrow_1 = DomHelper.bySelector("#task_arrow_1"); // 任务2箭头
	task_arrow_2 = DomHelper.bySelector("#task_arrow_2"); // 任务3箭头
	task_arrow_3 = DomHelper.bySelector("#task_arrow_3"); // 任务4箭头
	task_label_0 = DomHelper.bySelector("#task_label_0"); // 任务1标签
	task_label_1 = DomHelper.bySelector("#task_label_1"); // 任务2标签
	task_label_2 = DomHelper.bySelector("#task_label_2"); // 任务3标签
	task_label_3 = DomHelper.bySelector("#task_label_3"); // 任务4标签
	calendar_month_title = DomHelper.bySelector("#calendar_month_title"); // 日历月份
	calendar_month_dates = DomHelper.bySelector("#calendar_month_dates"); // 日历主体
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
		card_login_btn.addEventListener("click", async () => {
			await W2.login();
		});
		card_relogin_btn.addEventListener("click", async () => {
			await W2.login(); // 再写一个relogin函数
		});
		card_login_out_btn.addEventListener("click", async () => {
			await W2Request.logout();
			// 将UI置为默认状态
			this.card_work_status_value.innerText = W2.status.unknown;
			this.card_work_status_value.innerText = W2.status.unknown;
			calendar_month_title.innerText = W2.status.unknown;
			calendar_month_dates.innerHTML = "";

			Global.config.w2.w2_login_status = W2.status.not_login;
			Global.config.w2.w2_token_check_task = false;

		});
		card_switch_status_btn.addEventListener("click", async () => {
			if (card_work_status_value.innerText === "正在标注") {
				await W2Request.goMeal();
			} else if (card_work_status_value.innerText === "前往用餐") {
				await W2Request.goWork();
			}
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
		this.loginStatusTask();
		this.personalStatusTask();
		this.workingStatusTask();
		this.workHourStatusTask();
		this.currentTaskTask();
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
			this.card_login_status_value.innerText = Global.config.w2.w2_login_status || "--";
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
					this.card_working_status_value.innerText = W2.workingStatus[Global.config.w2.w2_personal_informat.data.working_status] || W2.status.unknown;
				} else {
					this.card_working_status_value.innerText = W2.status.unknown;
				}
			} else {
				this.card_working_status_value.innerText = W2.status.unknown;
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
					this.card_work_status_value.innerText = W2.workHourStatus[Global.config.w2.w2_personal_informat.data.work_hour_status] || W2.status.unknown;
				} else {
					this.card_work_status_value.innerText = W2.status.unknown;
				}
			} else {
				this.card_work_status_value.innerText = W2.status.unknown;
			}
			await System.sleepSeconds(3);
		}
	}
	async currentTaskTask() {
		Global.config.w2.w2_current_task_status_task = true;
		while (Global.config.w2.w2_current_task_status_task) {
			if (Global.config.w2.w2_login_status === W2.status.login_success) {
				for (let i = 0; i < 4; i++) {
					const icon = this["task_icon_" + i];
					const arrow = this["task_arrow_" + i];
					const label = this["task_label_" + i];
					// currentTask的值是currentTaskStatus枚举体中的键值, 由定时任务currentTask()变更
					if (label.innerText === Global.config.w2.w2_current_task_status) {
						icon.classList.replace("bg-blue-600", "bg-green-600");
						arrow.classList.replace("border-b-blue-600", "border-b-green-600");
					} else {
						icon.classList.replace("bg-green-600", "bg-blue-600");
						arrow.classList.replace("border-b-green-600", "border-b-blue-600");
					}
				}
			} else {
				for (let i = 0; i < 4; i++) {
					const icon = this["task_icon_" + i];
					const arrow = this["task_arrow_" + i];
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
			let result = await W2Request.queryCurrentMonthSchedule();
			if (Global.config.w2.w2_login_status === W2.status.login_success && result.code === 200) {
				// 日历标题实现
				calendar_month_title.innerText = Time.getCurrentYear() + " 年 " + Global.value.month + " 月";
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
				this.calendar_month_dates.innerHTML = '';
				for (let i = 0; i < offsetToSaturday; i++) {
					const emptyDiv = document.createElement("div");
					emptyDiv.className = "py-2 rounded";
					this.calendar_month_dates.appendChild(emptyDiv);
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
					this.calendar_month_dates.appendChild(dateDiv);
				}
				await System.sleepSeconds(60 * 60 * 8);
			} else {
				calendar_month_title.innerText = W2.status.unknown;
				calendar_month_dates.innerHTML = "";
				await System.sleepSeconds(3);
			}
		}
	}

	async init() {
		await W2Request.getLoginPage();
		// await W2.login();
		// 为每日任务写单独的函数出来
		// 在登录成功后禁用登录按钮 待定, 有空再看看要不要添加这个功能
		// 添加一个重新登录的按钮监听事件
		// 当前任务卡有bug, 每一次更新ui时将所有ui更新
		// this.currentTask();
	}
	// 定时任务
	static async currentTask() {
		
		TimerScheduler.setDailyTask(Time.getRandomTimeInRange(Global.config.w2.w2_login_range_start, Global.config.w2.w2_login_range_end), async () => { await W2.login() }, "W2_LOGIN_TASK");
		TimerScheduler.setDailyTask(Time.getRandomTimeInRange(Global.config.w2.w2_work_in_range_start, Global.config.w2.w2_work_in_range_end), async () => { 
			await W2Request.workIn();
			Global.config.w2.w2_current_task_status = W2.currentTaskStatus.workIn;
		}, "W2_WORK_IN_TASK");
		TimerScheduler.setDailyTask(Time.getRandomTimeInRange(Global.config.w2.w2_go_meal_range_start, Global.config.w2.w2_go_meal_range_end), async () => { 
			await W2Request.goMeal();
			Global.config.w2.w2_current_task_status = W2.currentTaskStatus.meal;
		}, "W2_GO_MEAL_TASK");
		TimerScheduler.setDailyTask(Time.getRandomTimeInRange(Global.config.w2.w2_go_work_range_start, Global.config.w2.w2_go_work_range_end), async () => { 
			await W2Request.goWork()
			Global.config.w2.w2_current_task_status = W2.currentTaskStatus.working;
		}, "W2_GO_WORK_TASK");
		TimerScheduler.setDailyTask(Time.getRandomTimeInRange(Global.config.w2.w2_work_out_range_start, Global.config.w2.w2_work_out_range_end), async () => { 
			await W2Request.workOut();
			Global.config.w2.w2_current_task_status = W2.currentTaskStatus.workOut;
		}, "W2_WORK_OUT_TASK");
		TimerScheduler.setDailyTask(Time.getRandomTimeInRange(Global.config.w2.w2_log_out_range_start, Global.config.w2.w2_log_out_range_end), async () => { await W2Request.logout();}, "W2_LOG_OUT_TASK");
	}
	static async isLogin() {
		let result = await W2Request.getTokenCheck();
		if (result.code === 200) {
			Global.config.w2.w2_token = result.data.token;
			return true;
		} else {
			return false;
		}
	}
	static async getLoginInformat() {
		let loginInformat = {
			loginStatus: null,
			workingStatus: null,
			workHourStatus: null
		};
		let getTokenResult = await W2Request.getToken();
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
	static async tokenCheck() {
		Global.config.w2.w2_token_check_task = true; // 开启任务
		while (Global.config.w2.w2_token_check_task === true) {
			let result = await W2Request.getTokenCheck();
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
		if (await W2.isLogin()) {
			Global.config.w2.w2_login_status = W2.status.login_success;
			this.log.log("W2已登录, 无需重复登录");
			W2.tokenCheck();
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
		Global.config.w2.w2_email_verify_code = result.data.data[0].content.match(new RegExp("\\d{6}", "g"))[0];
		this.log.log("正在登录");
		await W2Request.getToken();
		this.log.log("获取心跳");
		await W2Request.getTokenCheck();
		W2.tokenCheck();
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
	w2_account_test_button = DomHelper.bySelector("#w2_account_test_button"); // W2账号测试按钮
	w2_userid = DomHelper.bySelector("#w2_userid"); // W2账号输入框 账号
	w2_password = DomHelper.bySelector("#w2_password"); // W2密码输入框
	w2_api_test_button = DomHelper.bySelector("#w2_api_test_button"); // W2API测试按钮
	w2_email_api_id = DomHelper.bySelector("#w2_email_api_id"); // W2邮箱API输入框
	w2_email_api_secret = DomHelper.bySelector("#w2_email_api_secret"); // W2邮箱API密钥输入框
	w2_email_address = DomHelper.bySelector("#w2_email_address"); // W2邮箱输入框
	w2_email_pop3_auth_code = DomHelper.bySelector("#w2_email_pop3_auth_code"); // W2POP3授权码输入框
	w2_error_message = DomHelper.bySelector("#w2_error_message") // W2错误提示
	w2_info_message = DomHelper.bySelector("#w2_info_message"); // W2提示信息
	constructor() {
		super();
		this.bindEvents();
		this.updateUIElement();
		this.init();
	}
	bindEvents() {
		if (DomHelper.exists(this.btn_save_settings)) {
			this.btn_save_settings.addEventListener("click", async () => {
				Global.config.w2.w2_user_id = this.w2_userid.value;
				Global.config.w2.w2_user_password = this.w2_password.value;
				let result = await W2Request.getVerifyCode();
				if (result === 200) {
					this.w2_userid.classList.remove('border-red-500', 'focus:ring-red-500');
					this.w2_password.classList.remove('border-red-500', 'focus:ring-red-500');
					this.w2_info_message.classList.remove('hidden');
					this.w2_userid.classList.add('border-gray-300', 'focus:ring-blue-500');
					this.w2_password.classList.add('border-gray-300', 'focus:ring-blue-500');
					this.w2_error_message.classList.add('hidden');
				} else {
					this.w2_error_message.classList.remove('hidden');
					this.w2_userid.classList.remove('border-gray-300', 'focus:ring-blue-500');
					this.w2_password.classList.remove('border-gray-300', 'focus:ring-blue-500');
					this.w2_userid.classList.add('border-red-500', 'focus:ring-red-500');
					this.w2_password.classList.add('border-red-500', 'focus:ring-red-500');
					this.w2_info_message.classList.add('hidden');
					Global.config.w2.w2_user_id = null;
					Global.config.w2.w2_user_password = null;
				}
			});
		}
		if (DomHelper.exists(this.w2_account_test_button)) {
			this.w2_account_test_button.addEventListener("click", async () => {
				Global.config.w2.w2_user_id = this.w2_userid.value;
				Global.config.w2.w2_user_password = this.w2_password.value;
				let result = await W2Request.getVerifyCode(); // 直接返回状态信息
				this.log.debug("getVerifyCode: ", result);
				if (result.code === 200) {
					w2_info_message.querySelector("span").innerText = "W2连通性测试无误, 已为邮箱发送验证码";
					w2_userid.classList.remove('border-red-500', 'focus:ring-red-500');
					w2_password.classList.remove('border-red-500', 'focus:ring-red-500');
					w2_info_message.classList.remove('hidden');
					w2_userid.classList.add('border-gray-300', 'focus:ring-blue-500');
					w2_password.classList.add('border-gray-300', 'focus:ring-blue-500');
					w2_error_message.classList.add('hidden');
					Global.config.w2.w2_user_id = this.w2_userid.value;
					Global.config.w2.w2_user_password = this.w2_password.value;
				} else if (result === 5000) {
					w2_error_message.querySelector("span").innerText = "W2账号信息错误";
					w2_error_message.classList.remove('hidden');
					w2_userid.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_password.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_userid.classList.add('border-red-500', 'focus:ring-red-500');
					w2_password.classList.add('border-red-500', 'focus:ring-red-500');
					w2_info_message.classList.add('hidden');
					Global.config.w2.w2_user_id = null;
					Global.config.w2.w2_user_password = null;
				} else {
					w2_error_message.querySelector("span").innerText = "其他未知错误, 请重试";
					w2_error_message.classList.remove('hidden');
					w2_userid.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_password.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_userid.classList.add('border-red-500', 'focus:ring-red-500');
					w2_password.classList.add('border-red-500', 'focus:ring-red-500');
					w2_info_message.classList.add('hidden');
					Global.config.w2.w2_user_id = null;
					Global.config.w2.w2_user_password = null;
				}
			});
		}
		if (DomHelper.exists(this.w2_api_test_button)) {
			this.w2_api_test_button.addEventListener("click", async () => {
				Global.config.w2.w2_email_api_id = this.w2_email_api_id.value;
				Global.config.w2.w2_email_api_secret = this.w2_email_api_secret.value;
				Global.config.w2.w2_email_address = this.w2_email_address.value;
				Global.config.w2.w2_email_pop3_auth_code = this.w2_email_pop3_auth_code.value;
				let result = await W2Request.getEmailApi(); // 返回结果
				if (result.code === 200) {
					w2_info_message.querySelector("span").innerText = "W2邮箱API连通性测试无误, 已获取邮箱列表";
					w2_email_api_id.classList.remove('border-red-500', 'focus:ring-red-500');
					w2_email_api_secret.classList.remove('border-red-500', 'focus:ring-red-500');
					w2_email_address.classList.remove('border-red-500', 'focus:ring-red-500');
					w2_email_pop3_auth_code.classList.remove('border-red-500', 'focus:ring-red-500');
					
					w2_email_api_id.classList.add('border-gray-300', 'focus:ring-blue-500');
					w2_email_api_secret.classList.add('border-gray-300', 'focus:ring-blue-500');
					w2_email_address.classList.add('border-gray-300', 'focus:ring-blue-500');
					w2_email_pop3_auth_code.classList.add('border-gray-300', 'focus:ring-blue-500');

					w2_info_message.classList.remove('hidden');
					w2_error_message.classList.add('hidden');

					Global.config.w2.w2_email_api_id = this.w2_email_api_id.value;
					Global.config.w2.w2_email_api_secret = this.w2_email_api_secret.value;
					Global.config.w2.w2_email_address = this.w2_email_address.value;
					Global.config.w2.w2_email_pop3_auth_code = this.w2_email_pop3_auth_code.value;
				} else {
					w2_error_message.querySelector("span").innerText = result.code + " " + result.msg;

					w2_email_api_id.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_email_api_secret.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_email_address.classList.remove('border-gray-300', 'focus:ring-blue-500');
					w2_email_pop3_auth_code.classList.remove('border-gray-300', 'focus:ring-blue-500');

					w2_email_api_id.classList.add('border-red-500', 'focus:ring-red-500');
					w2_email_api_secret.classList.add('border-red-500', 'focus:ring-red-500');
					w2_email_address.classList.add('border-red-500', 'focus:ring-red-500');
					w2_email_pop3_auth_code.classList.add('border-red-500', 'focus:ring-red-500');

					w2_error_message.classList.remove('hidden');
					w2_info_message.classList.add('hidden');

					Global.config.w2.w2_email_api_id = null;
					Global.config.w2.w2_email_api_secret = null;
					Global.config.w2.w2_email_address = null;
					Global.config.w2.w2_email_pop3_auth_code = null;
				}
			});
		}
	}
	updateUIElement() {
		// this.w2_user_id_HtmlDom = DomHelper.bySelector("#w2_userid_setting");
		// this.log.log("W2HDom: ", this.w2_user_id_HtmlDom);
		// this.w2_user_id_HtmlDom.value = "bbb";
		if (Global.config.w2.w2_user_id !== null && Global.config.w2.w2_user_password !== null) {
			this.w2_userid.value = Global.config.w2.w2_user_id;
			this.w2_password.value = Global.config.w2.w2_user_password;
		}
		if (Global.config.w2.w2_email_api_id !== null && 
			Global.config.w2.w2_email_api_secret !== null &&
		 	Global.config.w2.w2_email_address !== null && 
		 	Global.config.w2.w2_email_pop3_auth_code !== null) {
			this.w2_email_api_id.value = Global.config.w2.w2_email_api_id;
			this.w2_email_api_secret.value = Global.config.w2.w2_email_api_secret;
			this.w2_email_address.value = Global.config.w2.w2_email_address;
			this.w2_email_pop3_auth_code.value = Global.config.w2.w2_email_pop3_auth_code;
		}
	}
	init() {
		
	}
}