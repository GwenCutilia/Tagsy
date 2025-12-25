class LSGlobal extends Global {
	static async init() {
		// 可以调用父类方法初始化子类自己的对象
		this.cache = await super.initObject(this.cache, "LSGlobal.cache");
		this.status = await super.initObject(this.status, "LSGlobal.status");
		this.setting = await super.initObject(this.setting, "LSGlobal.setting");
	}
	static cache = {
		information: {
			// 账号信息
			name: null,
			password: null,
		},
		cookie: {
			// cookie缓存
			token: null, // 令牌
			id: null, // 用户编号
			task_id: null, // 工作区编号
			sub_task_id: null, // 子工作区编号
			name: null, // 用户日报名称
		},
		dailyReport: {
			list: null, // 日报列表
		}
	}
	static status = {
		// 登录状态
		login: null,
		// fill_daily_report_status: null, // 日报打卡状态
	}
	static task = {
		dailyTask: {
			login: "LS_LOGIN_DAILY_TASK", // 
			loginOut: "LS_LOGIN_OUT_DAILY_TASK", // 
			fillDailyReport: "LS_FILL_DAILY_REPORT_DAILY_TASK", //
		},
		uiTask: {
			login: "LS_LOGIN_UI_TASK",
			getDailyReportList: "LS_GET_DAILY_REPORT_LIST_UI_TASK",
			fillDailyReportStatus: "LS_FILL_DAILY_REPORT_STATUS_UI_TASK",
			dailyReportList: "LS_DAILY_REPORT_LIST_UI_TASK",
		}
	}
	static setting = {
		// 日报列表的页数 && 页大小
		daily_report_page_num: 1,
		daily_report_page_size: 3,
		// 模块时间区间任务设置
		time_range_login_start: "08:50",
		time_range_login_end: "08:50",
		time_range_login_out_start: "18:35", 
		time_range_login_out_end: "18:35", 
		time_range_fill_daily_report_start: "17:00",
		time_range_fill_daily_report_end: "17:00",
	}
	// 状态映射
	static statusMap = {
		loginStatus: {
			success: "登录成功",
			failed: "登录失败",
			out: "已登出",
		},
		dailyReportStatus: {
			not: "未打卡",
			already: "已打卡",
			failed: "打卡失败", // 打卡失败
		},
		unknown: "--"
	};
	static domMap = {
		// 登录状态
		login_btn: "#login_btn", // 登录按钮
		login_out_btn: "#login_out_btn", // 登录状态标签
		login_status_label: "#login_status_label", // 签到签出标签
		// 打卡状态
		fill_daily_report_btn: "#fill_daily_report_btn", // 打卡按钮
		fill_daily_report_label: "#fill_daily_report_label", // 打卡状态标签
		// 日报列表
		daily_report_list_loading: "#daily_report_list_loading",
		daily_report_list_label: "#daily_report_list_label", // 日报列表标题
		daily_report_list_table: "#daily_report_list_table", // 日报列表表格
	}
}