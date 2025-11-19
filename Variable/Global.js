class Global {
	// w2_user_id: 'lingboweibu(beijing)kejiyouxiangongsi_1101488685013168128',
	// user_password: 'c3uDfDbKTUICcOoG',
	// w2_email_api_id_account_setting_input: '10008362',
	// w2_email_api_secret_account_setting_input: '1d0c8fec499fb7057027e09fc4662fb0',
	// w2_email_api_address_account_setting_input: '1778751963@qq.com', 
	// w2_email_api_pop3_auth_code_account_setting_input: 'rjkiywoldplaceca',
	static config = {
		cache: {
			login_status: false,
			notice: null,
		},
		login: {
			query_id: null, // 查询id
			user_avatar_url: null, // 头像地址
			user_name: null,
			user_password: null,
			user_uid: null,
			user_nick_name: null,
		},
		system: {
			status: false,
			operating_status: false,
			running_time: 0,
		},
		apibox: {
			user_id: null,
			api_key: null,
		},
		w2: {
			// 登录信息
			user_name: null,
			user_password: null,
			email_api_address: null,
			email_api_pop3_auth_code: null,
			// 登录验证码
			email_api_verify_code: null,
			personal_informat: null, // 个人信息
			token: null,
			tenant_token: null,
			// 登录信息
			login_status: null,
			check_in_out_status: null, // 考勤打卡状态
			meal_working_status: null, // 工作时长状态
			current_time_line_task_status: null, // 定时打卡任务, 当前任务选项卡
			// 抽调请求
			apply_activity_transfer_time: null,
			apply_activity_transfer_momo: null,
			apply_activity_transfer_table: null,
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
		},
		ls: {
			// 账号信息
			user_name: null,
			user_password: null,
			// 日报列表的页数 && 页大小
			daily_report_page_num: 1,
			daily_report_page_size: 3,
			// 登录状态
			login_status: null,
			// fill_daily_report_status: null, // 日报打卡状态
			// cookie缓存
			token: null, // 令牌
			user_id: null, // 用户编号
			task_id: null, // 工作区编号
			sub_task_id: null, // 子工作区编号
			daily_report_list: null, // 日报列表
			// 模块时间区间任务设置
			time_range_login_start: "08:50",
			time_range_login_end: "08:50",
			time_range_login_out_start: "18:35", 
			time_range_login_out_end: "18:35", 
			time_range_fill_daily_report_start: "17:00",
			time_range_fill_daily_report_end: "17:00",
		},
		setting: {
			
		},
		ui: {},
	};
	
	static value = {
		// 累加器 && 标志位
		month: Time.getCurrentMonth(), // 当前月份
		apply_approval_transfer_list_page: 1,
	}
	static w2_TaskConfig = {
		W2_LOGIN_TASK: "W2_LOGIN_TASK",
		W2_CHECK_IN_TASK: "W2_CHECK_IN_TASK",
		W2_MEAL_TASK: "W2_MEAL_TASK",
		W2_WORKING_TASK: "W2_WORKING_TASK",
		W2_CHECK_OUT_TASK: "W2_CHECK_OUT_TASK",
		W2_LOGIN_OUT_TASK: "W2_LOGIN_OUT_TASK",
	}
	static ls_TaskConfig = {
		LS_LOGIN_STATUS_TASK: "LS_LOGIN_STATUS_TASK",
		LS_GET_DAILY_REPORT_LIST_TASK: "LS_GET_DAILY_REPORT_LIST_TASK",
		LS_FILL_DAILY_REPORT_STATUS_TASK: "LS_FILL_DAILY_REPORT_STATUS_TASK",
		LS_DAILY_REPORT_LIST_STATUS_TASK: "LS_DAILY_REPORT_LIST_TASK",
		LS_CLEAR_DAILY_REPORT_STATUS_TASK: "LS_CLEAR_DAILY_REPORT_STATUS_TASK",
		LS_LOGIN_TASK: "LS_LOGIN_TASK",
		LS_LOGIN_OUT_TASK: "LS_LOGIN_OUT_TASK",
		LS_FILL_DAILY_REPORT_TASK: "LS_FILL_DAILY_REPORT_TASK",
	}

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
class LSGlobal extends Global {
	static async init() {
		// 可以调用父类方法初始化子类自己的对象
		this.cache = await super.initObject(this.cache, "LSGlobal.cache");
		this.setting = await super.initObject(this.setting, "LSGlobal.setting");
	}
	static cache = {
		// 账号信息
		user_name: null,
		user_password: null,
		// 登录状态
		login_status: null,
		// fill_daily_report_status: null, // 日报打卡状态
		// cookie缓存
		token: null, // 令牌
		user_id: null, // 用户编号
		task_id: null, // 工作区编号
		sub_task_id: null, // 子工作区编号
		daily_report_list: null, // 日报列表
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
		lso_account_setting_message_box: "#ls_account_setting_message_box",	// LS提示信息

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
	static async init() {

	}
}
class FrameworkGlobal extends Global {
	// Framework所需要的全局变量
	static cache = {
		notice: null,
	}
	// DOM元素映射表
	static domMap = {
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
	static async init() {
		// 可以调用父类方法初始化子类自己的对象
		this.value = await super.initObject(this.cache, "FrameworkGlobal.commonValue");
	}
}