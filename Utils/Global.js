class Global {
	// w2_user_id: 'lingboweibu(beijing)kejiyouxiangongsi_1101488685013168128',
	// user_password: 'c3uDfDbKTUICcOoG',
	// w2_email_api_id_account_setting_input: '10008362',
	// w2_email_api_secret_account_setting_input: '1d0c8fec499fb7057027e09fc4662fb0',
	// w2_email_api_address_account_setting_input: '1778751963@qq.com', 
	// w2_email_api_pop3_auth_code_account_setting_input: 'rjkiywoldplaceca',

	static log = new Logger("Global");

	/**
	 * 通用对象初始化方法，返回代理对象
	 */
	static async initObject(obj, rootKey) {
		await this.traverseConfig(obj, rootKey);
		return this.setupProxyFor(obj, rootKey);
	}

	static async traverseConfig(obj, parentKey = '') {
		for (const key in obj) {
			const fullKey = parentKey ? `${parentKey}.${key}` : key;
			if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
				await this.traverseConfig(obj[key], fullKey);
			} else {
				const storedValue = await GM.GetValue(fullKey);
				if (storedValue !== undefined) {
					obj[key] = storedValue;
					this.log.log(`已从存储加载配置: ${fullKey}`);
				} else {
					await GM.SetValue(fullKey, obj[key]);
					this.log.log(`已初始化配置: ${fullKey} = ${obj[key]}`);
				}
			}
		}
	}

	static setupProxyFor(obj, parentKey = '') {
		const createProxy = (targetObj, path = '') => {
			for (const key in targetObj) {
				if (typeof targetObj[key] === 'object' && targetObj[key] !== null && !Array.isArray(targetObj[key]) && !(targetObj[key] instanceof Date)) {
					targetObj[key] = createProxy(targetObj[key], `${path ? path + '.' : ''}${key}`);
				}
			}

			return new Proxy(targetObj, {
				set(t, k, v) {
					const fullKey = path ? `${path}.${k}` : k;

					if (typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date)) {
						t[k] = createProxy(v, fullKey);
					} else {
						t[k] = v;
						GM.SetValue(fullKey, v);
						Global.log.log(`已更新配置: ${fullKey} = ${v}`);
					}
					return true;
				}
			});
		};

		return createProxy(obj, parentKey);
	}

	static async init() {
		this.config = await this.initObject(this.config, "config");
	}
	static getKey(obj, path) {
		const keys = path.split('.');
		let value = obj;
		for (const key of keys) {
			if (value && typeof value === 'object' && key in value) {
				value = value[key];
			} else {
				this.log.error(`路径不存在: ${path}`);
				return null;
			}
		}
		return value;
	}
	static setKey(obj, path, newValue) {
		const keys = path.split('.');
		let target = obj;

		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			if (target && typeof target === 'object' && key in target) {
				target = target[key];
			} else {
				this.log.error(`路径不存在: ${path}`);
				return;
			}
		}

		const lastKey = keys[keys.length - 1];
		target[lastKey] = newValue;

		// 同步 GM 存储
		const fullKey = path; // 这里可以根据需要加前缀，比如 "config." 或 "FrameworkGlobal.value."
		GM.SetValue(fullKey, newValue);
		this.log.log(`已更新路径: ${fullKey} = ${newValue}`);
	}
}
class LoginGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "LoginGlobal.cache");
		this.status = await super.initObject(this.status, "LoginGlobal.status");
	}
	static cache = {
		information: {
			name: null,
			password: null,
		},
		cookie: {
			uid: null,
			nick_name: null,
			avatar_url: null,
			query_id: null,
		}
	}
	static status = {
		login: false,
	}
	static domMap = {
		// 背景
		animation_canvas: "#animation_canvas",
		// 用户名&&密码
		infomation_div: "#infomation_div",
		password_toggle_btn: "#password_toggle_btn",
		username_input: "#username_input",
		password_input: "#password_input",
		// 登录&&注册
		login_btn: "#login_btn",
		register_btn: "#register_btn",
		// 二维码
		qr_div: "#qr_div",
		qr_toggle_btn: "#qr_toggle_btn",
		qr_url_img: "#qr_url_img",
	}
}
class IndexGlobal extends Global {
	static async init() {
		// 可以调用父类方法初始化子类自己的对象
		// this.cache = await super.initObject(this.cache, "W2Global.cache");
		// this.setting = await super.initObject(this.setting, "W2Global.setting");
	}
	static domMap = {
		// 加载状态
		loading_status_label: "#loading_status_label",
		load_btn: "#load_btn",
		unload_btn: "#unload_btn",
		// 运行状态
		running_status_label: "#running_status_label",
		running_start_btn: "#running_start_btn",
		running_stop_btn: "#running_stop_btn",
		// 工作时间
		worked_hours_label: "#worked_hours_label",
		remain_hours_label: "#remain_hours_label",
		// 日志
		running_log_content: "#running_log_content",
		clear_log_btn: "#clear_log_btn",
	}
}
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
class QLabelWorkGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "QLabelWorkGlobal.cache");
		this.setting = await super.initObject(this.setting, "QLabelWorkGlobal.setting");
	}
	// 缓存
	static cache = {
		api: {
			listLabelTasks: {
				start: 0, // 从第几题开始查询
			},
		},
		cookie: {
			task: {
				taskId: null,
				packKey: null,
				taskName: null,
				detailId: null,
			},
			pack: {
				detailLabel: {
					"tags": [
						{
							"name": "imgMask",
							"label":"imgMask"
						}
					],
					"extData":null,
					"objects":[]
				},
			},
			local: {
				session: null,
				route: null,
			}
		},
		resultData: [
			{

			}
		],
	}
	
	static setting = {

	}
}
class ApiboxGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "ApiboxGlobal.cache");
	}
	static cache = {
		information: {
			id: null,
			key: null,
		}
	}
}
class SettingGlobal extends Global {
	static domMap = {
		// API盒子账号设置
		api_box_user_test_account_setting_button: "#api_box_user_test_account_setting_button",	// API盒子账号测试按钮
		api_box_user_id_account_setting_input: "#api_box_user_id_account_setting_input",	// API盒子通讯ID输入框
		api_box_api_key_account_setting_input: "#api_box_api_key_account_setting_input",	// API盒子通讯密钥输入框
		api_box_account_setting_message_box: "#api_box_account_setting_message_box",	// API盒子信息框

		// W2账号设置
		w2_user_test_account_setting_button: "#w2_user_test_account_setting_button",	// W2账号测试按钮
		w2_user_name_account_setting_input: "#w2_user_name_account_setting_input",	// W2账号输入框 账号
		w2_user_password_account_setting_input: "#w2_user_password_account_setting_input",	// W2密码输入框
		w2_email_api_test_account_setting_button: "#w2_email_api_test_account_setting_button",	// W2API测试按钮
		w2_email_api_address_account_setting_input: "#w2_email_api_address_account_setting_input",	// W2邮箱输入框
		w2_email_api_pop3_auth_code_account_setting_input: "#w2_email_api_pop3_auth_code_account_setting_input",	// W2POP3授权码输入框
		w2_account_setting_message_box: "#w2_account_setting_message_box",	// W2提示信息

		// W2模块设置
		w2_time_range_validate_format_module_setting_button: "#w2_time_range_validate_format_module_setting_button",	// W2验证格式按钮
		w2_time_range_login_start_module_setting_input: "#w2_time_range_login_start_module_setting_input",	// W2登录时间段开始输入框
		w2_time_range_login_end_module_setting_input: "#w2_time_range_login_end_module_setting_input",	// W2登录时间段结束输入框
		w2_time_range_login_out_start_module_setting_input: "#w2_time_range_login_out_start_module_setting_input",	// W2登出时间段开始输入框
		w2_time_range_login_out_end_module_setting_input: "#w2_time_range_login_out_end_module_setting_input",	// W2登出时间段结束输入框
		w2_time_range_check_in_start_module_setting_input: "#w2_time_range_check_in_start_module_setting_input",	// W2上班时间段开始输入框
		w2_time_range_check_in_end_module_setting_input: "#w2_time_range_check_in_end_module_setting_input",	// W2上班时间段结束输入框
		w2_time_range_check_out_start_module_setting_input: "#w2_time_range_check_out_start_module_setting_input",	// W2下班时间段开始输入框
		w2_time_range_check_out_end_module_setting_input: "#w2_time_range_check_out_end_module_setting_input",	// W2下班时间段结束输入框
		w2_time_range_meal_start_module_setting_input: "#w2_time_range_meal_start_module_setting_input",	// W2吃饭时间段开始输入框
		w2_time_range_meal_end_module_setting_input: "#w2_time_range_meal_end_module_setting_input",	// W2吃饭时间段结束输入框
		w2_time_range_working_start_module_setting_input: "#w2_time_range_working_start_module_setting_input",	// W2工作时间段开始输入框
		w2_time_range_working_end_module_setting_input: "#w2_time_range_working_end_module_setting_input",	// W2工作时间段结束输入框
		w2_module_setting_message_box: "#w2_module_setting_message_box",	// W2高级设置提示信息

		// LS账号设置
		ls_user_test_account_setting_button: "#ls_user_test_account_setting_button",	// LS账号测试按钮
		ls_user_name_account_setting_input: "#ls_user_name_account_setting_input",	// LS账号输入框 账号
		ls_user_password_account_setting_input: "#ls_user_password_account_setting_input",	// LS密码输入框
		ls_account_setting_message_box: "#ls_account_setting_message_box",	// LS提示信息

		// LS模块设置
		ls_time_range_validate_format_module_setting_button: "#ls_time_range_validate_format_module_setting_button", // 格式校验按钮
		ls_time_range_login_start_module_setting_input: "#ls_time_range_login_start_module_setting_input",	// LS登录时间段开始输入框
		ls_time_range_login_end_module_setting_input: "#ls_time_range_login_end_module_setting_input",	// LS登录时间段结束输入框
		ls_time_range_login_out_start_module_setting_input: "#ls_time_range_login_out_start_module_setting_input",	// LS登出时间段开始输入框
		ls_time_range_login_out_end_module_setting_input: "#ls_time_range_login_out_end_module_setting_input",	// LS登出时间段结束输入框
		ls_time_range_fill_daily_report_start_module_setting_input: "#ls_time_range_fill_daily_report_start_module_setting_input",	// LS日报开始输入框
		ls_time_range_fill_daily_report_end_module_setting_input: "#ls_time_range_fill_daily_report_end_module_setting_input",	// LS日报结束输入框
		ls_module_setting_message_box: "#ls_module_setting_message_box",	// LS高级设置提示信息
	};
	// 字段映射
	static fieldMappings = [
		
	];

	static async init() {

	}
}
class FrameworkGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "FrameworkGlobal.cache");
	}

	// Framework所需要的全局变量
	static cache = {
		notice: {
			content: null,
		}
	}
	// DOM元素映射表
	static domMap = {
		// 主页面遮罩loading
		main_loading: "#main_loading",
		// 用户头像
		user_avatar: "#user_avatar",
		// 消息中心
		notice_btn: "#notice_btn",
		notice_i: "#notice_i",
		notice_panel_div: "#notice_panel_div",
		notice_list_div: "#notice_list_div",
		notice_div: "#notice_div",
		notice_label: "#notice_label",
		notice_time_label: "#notice_time_label",
		notice_close: "#notice_close",

		// 底部导航栏
		model_status: "#model_status",
		model_status_w2_i: "#model_status_w2_i",
		model_status_w2_loading: "#model_status_w2_loading",
		model_status_w2_label: "#model_status_w2_label",
		model_status_ls_i: "#model_status_ls_i",
		model_status_ls_loading: "#model_status_ls_loading",
		model_status_ls_label: "#model_status_ls_label",

		// 天气状态
		weather_message_box: "#weather_message_box",
		weather_div: "#weather_div",
		weather_icon: "#weather_icon",
		weather_temp_label: "#weather_temp_label",
		weather_city_label: "#weather_city_label",
		weather_wind_label: "#weather_wind_label"
	};
}
class SystemGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "SystemGlobal.cache");
	}
	static cache = {

	}
	static status = {
		load: false,
	}
}