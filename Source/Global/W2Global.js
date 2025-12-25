class W2Global extends Global {
	static async init() {
		// 可以调用父类方法初始化子类自己的对象
		this.cache = await super.initObject(this.cache, "W2Global.cache");
		this.status = await super.initObject(this.status, "W2Global.status");
		this.setting = await super.initObject(this.setting, "W2Global.setting");
	}
	static cache = {
		information: {
			// 登录信息
			name: null,
			password: null,
			address: null,
			pop3_auth_code: null,
			verify_code: null,
			informat: null, // 个人信息
		},
		cookie: {
			// 登录验证码
			token: null,
			tenant_token: null,
		},
		// 抽调请求
		applyActivityTransfer: {
			time: null,
			momo: null,
			table: null,
		}
	}
	static status = {
		// 登录信息
		login: null,
		check_in_out: null, // 考勤打卡状态
		meal_workings: null, // 工作时长状态
		current_time_line: null, // 定时打卡任务, 当前任务选项卡
	}
	static setting = {
		calendar: {
			month: Time.getCurrentMonth(),
		},
		applyActivityTransferList: {
			page: 1,
		},
		time_range: {

		},
		// 模块时间区间任务设置
		time_range_login_start: "08:50",
		time_range_login_end: "08:50",
		time_range_check_in_start: "08:55",
		time_range_check_in_end: "08:55",
		time_range_meal_start: "12:00",
		time_range_meal_end: "12:00",
		time_range_working_start: "13:30",
		time_range_working_end: "13:30",
		time_range_check_out_start: "18:30",
		time_range_check_out_end: "18:30",
		time_range_login_out_start: "18:35",
		time_range_login_out_end: "18:35",
	}
	static task = {
		dailyTask: {
			login: "W2_LOGIN_DAILY_TASK",
			chinekIn: "W2_CHECK_IN_DAILY_TASK",
			meal: "W2_MEAL_DAILY_TASK",
			working: "W2_WORKING_DAILY_TASK",
			checkOut: "W2_CHECK_OUT_DAILY_TASK",
			loginOut: "W2_LOGIN_OUT_DAILY_TASK",
		},
		intervalTask: {
			loginCheck: "W2_LOGIN_CHECK_INTERVAL_TASK",
		},
		uiTask: {
			login: "W2_LOGIN_UI_TASK",
			working: "W2_WORKING_UI_TASK",
			workHour: "W2_WORK_HOUR_UI_TASK",
			currentTimeLine: "W2_CURRENT_TIME_LINE_UI_TASK",
			personal: "W2_PERSONAL_UI_TASK",
			calendar: "W2_CALENDAR_UI_TASK",
			applyActivityTransferList: "W2_APPLY_ACTIVITY_TRANSFER_LIST_UI_TASK",
		}
	}
	static statusMap = {
		loginStatus: {
			not_login: "未登录",
			logining: "登录中",
			login_success: "已登录",
			login_failed: "登录失败",
		},
		currentTaskStatus: {
			workIn: "上班打卡",
			meal: "前往用餐", 
			working: "切换标注",
			workOut: "下班打卡",
		},
		workHourStatus: {
			working: "正在标注",
			meal: "前往用餐"
		},
		workingStatus: {
			not_check_in: "未打卡",
			already_check_in: "已打卡",
			already_check_out: "已下班"
		},
		unknown: "--"
	}
	static domMap = {
		login_status_label: "#login_status_label", // 登录状态
		login_btn: "#login_btn", // 登录按钮
		relogin_btn: "#relogin_btn", // 重新登录按钮
		login_out_btn: "#login_out_btn", // 退出登录按钮
		// 考勤状态
		check_in_out_label: "#check_in_out_label", // 考勤打卡状态
		check_in_btn: "#check_in_btn", // 打卡按钮
		check_out_btn: "#check_out_btn", // 下班按钮
		// 工作状态
		meal_working_status_label: "#meal_working_status_label", // 工作状态
		meal_working_status_btn: "#meal_working_status_btn", // 切换状态按钮
		// 任务线
		current_time_line_task_start_btn: "#current_time_line_task_start_btn", // 开始W2任务按钮
		current_time_line_task_stop_btn: "#current_time_line_task_stop_btn", // 停止W2任务按钮
		// 任务开关
		current_time_line_task_turn_on_off_i: "#current_time_line_task_turn_on_off_i", // 任务开关图标
		// 待优化, 图标全部改成font-awesome图标
		current_time_line_task_icon_0: "#current_time_line_task_icon_0", // 任务1图标
		current_time_line_task_icon_1: "#current_time_line_task_icon_1", // 任务2图标
		current_time_line_task_icon_2: "#current_time_line_task_icon_2", // 任务3图标
		current_time_line_task_icon_3: "#current_time_line_task_icon_3", // 任务4图标
		current_time_line_task_label_0: "#current_time_line_task_label_0", // 任务1标签
		current_time_line_task_label_1: "#current_time_line_task_label_1", // 任务2标签
		current_time_line_task_label_2: "#current_time_line_task_label_2", // 任务3标签
		current_time_line_task_label_3: "#current_time_line_task_label_3", // 任务4标签
		// 排班列表
		calendar_loading: "#calendar_loading",
		calendar_label: "#calendar_label", // 日历月份
		calendar_title: "#calendar_title", // 日历标题
		calendar_table: "#calendar_table", // 日历主体
		prev_month_btn: "#prev_month_btn", // 查看上个月排班按钮
		next_month_btn: "#next_month_btn", // 查看下个月排班按钮
		// 抽调申请
		apply_activity_transfer_btn: "#apply_activity_transfer_btn", // 申请抽调按钮
		apply_activity_transfer_type_div: "#apply_activity_transfer_type_div", // 申请抽调类型
		apply_activity_transfer_type_label: "#apply_activity_transfer_type_label", // 申请抽调类型标签
		apply_activity_transfer_type_ul: "#apply_activity_transfer_type_ul", // 申请抽调类型列表
		apply_activity_transfer_time_text: "#apply_activity_transfer_time_text", // 申请抽调时间
		apply_activity_transfer_momo_text: "#apply_activity_transfer_momo_text", // 申请抽调备注
		apply_activity_transfer_message_box: "#apply_activity_transfer_message_box", // 信息提示框
		// 抽调列表
		apply_activity_transfer_loading: "#apply_activity_transfer_loading", // 加载图标
		apply_activity_transfer_label: "#apply_activity_transfer_label", // 申请抽调列表标签
		apply_activity_transfer_table: "#apply_activity_transfer_table", // 申请抽调列表表格
		apply_activity_transfer_prev_page_btn: "#apply_activity_transfer_prev_page_btn", // 抽调列表上一页按钮
		apply_activity_transfer_next_page_btn: "#apply_activity_transfer_next_page_btn", // 抽调列表下一页按钮
		apply_activity_transfer_refresh_page_btn: "#apply_activity_transfer_refresh_page_btn", // 抽调列表刷新按钮
	}
}