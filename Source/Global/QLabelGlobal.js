class QLabelGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "QLabelGlobal.cache");
		this.setting = await super.initObject(this.setting, "QLabelGlobal.setting");
	}
	static cache = {
		cookie: {
			
		}
	}
	static task = {
		uiTask: {
			annotationList: "QLABEL_ANNOTATION_LIST_UI_TASK",
			homeworkLoadTatistics: "QLABEL_HOMEWORK_LOAD_TATISTICS_UI_TASK",
			workHour: "QLABEL_WORK_HOUR_UI_TASK",
		}
	}
	static setting = {
		// 作业量统计
		homeworkLoadStatistics: {
			hourList: [],
		},
		// 标注列表
		annotationList: {
			lookupTime: {
				startTime: 0,
				endTime: 1,
			},
			tasknameAndIndicators: [
				{ taskname: "任务1", indicators: 5 }, // 这个变量是示例
				{ taskname: "任务2", indicators: 10 },
			]
		}
	}
	static domMap = {
		login_status_div: "#login_status_div", // 登录状态区域
		worked_hours: "#worked_hours", // 已工作时长标签
		worked_hours_label: "#worked_hours_label", // 已工作时长数值
		remain_hours_label: "#remain_hours_label", // 剩余工作时长数值
		homework_load_statistics_div: "#homework_load_statistics_div", // 作业量统计区域
		homework_load_tatistics_background_bar: "#homework_load_tatistics_background_bar",
		login_status_label: "#login_status_label", // 登录状态标签
		annotation_list_title: "#annotation_list_title", // 标注列表标题
		prev_day_btn: "#prev_day_btn", // 前一天按钮
		next_day_btn: "#next_day_btn", // 后一天按钮
		reflash_btn: "#reflash_btn", // 刷新按钮
		annotation_list_loading: "#annotation_list_loading", // 标注列表加载图标
		annotation_list_table: "#annotation_list_table", // 标注列表表格
	}
}