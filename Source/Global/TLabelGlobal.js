class TLabelGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "TLabelGlobal.cache");
		this.setting = await super.initObject(this.setting, "TLabelGlobal.setting");
	}
	static cache = {
		information: {
			login: {
				uuid: null,
			}

		},
		cookie: {

		}
	}
	static task = {
		uiTask: {
			// annotationList: "QLABEL_ANNOTATION_LIST_UI_TASK",
			// homeworkLoadTatistics: "QLABEL_HOMEWORK_LOAD_TATISTICS_UI_TASK",
			// workHour: "QLABEL_WORK_HOUR_UI_TASK",
		},
		dailyTask: {
			loginProcess: "TLabel_LOGIN_PROCESS_DAILY_TASK",
			checkIn: "TLabel_CHECK_IN_DAILY_TASK",
			meal: "TLabel_MEAL_DAILY_TASK",
			work: "TLabel_WORK_DAILY_TASK",
			checkOut: "TLabel_CHECK_OUT_DAILY_TASK",
			logOut: "TLabel_LOGIN_OUT_DAILY_TASK",
		}
	}
	static setting = {
		currentTask: {
			time_range_login_process_start: "08:50", // 登录开始时间
			time_range_login_process_end: "08:50", // 登录结束时间
			time_range_check_in_start: "09:00", // 签到开始时间
			time_range_check_in_end: "09:00", // 签到结束时间
			time_range_meal_start: "12:00", // 用餐开始时间
			time_range_meal_end: "12:00", // 用餐结束时间
			time_range_work_start: "13:30", // 标注开始时间
			time_range_work_end: "13:30", // 标注结束时间
			time_range_check_out_start: "18:30", // 签退开始时间
			time_range_check_out_end: "18:30", // 签退结束时间
			time_range_log_out_start: "18:50", // 退出登录开始时间
			time_range_log_out_end: "18:50", // 退出登录结束时间
		}
		// 作业量统计
		// homeworkLoadStatistics: {
		// 	hourList: [],
		// },
		// 标注列表
		// annotationList: {
		// 	lookupTime: {
		// 		startTime: 0,
		// 		endTime: 1,
		// 	},
		// 	tasknameAndIndicators: [
		// 		{ taskname: "任务1", indicators: 5 }, // 这个变量是示例
		// 		{ taskname: "任务2", indicators: 10 },
		// 	]
		// }
	}
	static domMap = {
		// login_status_div: "#login_status_div", // 登录状态区域
		// worked_hours: "#worked_hours", // 已工作时长标签
		// worked_hours_label: "#worked_hours_label", // 已工作时长数值
		// remain_hours_label: "#remain_hours_label", // 剩余工作时长数值
		// homework_load_statistics_div: "#homework_load_statistics_div", // 作业量统计区域
		// homework_load_statistics_loading: "#homework_load_statistics_loading", // 作业量统计加载图标
		// homework_load_tatistics_background_bar: "#homework_load_tatistics_background_bar",
		// login_status_label: "#login_status_label", // 登录状态标签
		// annotation_list_title: "#annotation_list_title", // 标注列表标题
		// annotation_list_loading: "#annotation_list_loading", // 标注列表加载图标
		// prev_day_btn: "#prev_day_btn", // 前一天按钮
		// next_day_btn: "#next_day_btn", // 后一天按钮
		// reflash_btn: "#reflash_btn", // 刷新按钮
		// annotation_list_table: "#annotation_list_table", // 标注列表表格
	}
}