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

	static async init() {
		await this.traverseConfig(this.config);
		this.setupConfigProxy(); // 初始化代理
	}

	static async traverseConfig(configObj, parentKey = '') {
		for (const key in configObj) {
			const fullKey = parentKey ? `${parentKey}.${key}` : key;
			if (typeof configObj[key] === 'object' && configObj[key] !== null && !Array.isArray(configObj[key])) {
				await this.traverseConfig(configObj[key], fullKey);
			} else {
				const storedValue = await GM.GetValue(fullKey);
				if (storedValue !== undefined) {
					configObj[key] = storedValue;
					this.log.log(`已从存储加载配置: ${fullKey}`);
				} else {
					await GM.SetValue(fullKey, configObj[key]);
					this.log.log(`已初始化配置: ${fullKey} = ${configObj[key]}`);
				}
			}
		}
	}

	static setupConfigProxy() {
		// 递归为对象及所有嵌套对象创建代理
		const createProxy = (obj, parentKey = '') => {
			// 1. 先为现有嵌套对象递归创建代理
			for (const key in obj) {
				if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
					obj[key] = createProxy(obj[key], `${parentKey ? parentKey + '.' : ''}${key}`);
				}
			}

			// 2. 创建当前对象的代理
			return new Proxy(obj, {
				set(target, key, value) {
					const fullKey = parentKey ? `${parentKey}.${key}` : key;
					
					// 如果新值是对象，为其创建代理
					if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
						target[key] = createProxy(value, fullKey);
					} else {
						target[key] = value;
						// 同步到存储并输出日志（现在会正常触发）
						GM.SetValue(fullKey, value);
						Global.log.log(`已更新配置: ${fullKey} = ${value}`);
					}
					return true;
				}
			});
		};

		// 为根配置对象应用代理（会自动递归处理所有嵌套对象）
		this.config = createProxy(this.config);
	}

	/**
	 * 获取指定路径的配置值（可选，用于兼容旧代码）
	 * @static
	 * @param {string} path - 配置路径，如 'system.status'
	 * @returns {any|null} 对应的值，若路径不存在则返回null并记录错误
	 */
	static getKey(path) {
		const keys = path.split('.');
		let value = this.config;
		
		for (const key of keys) {
			if (value && typeof value === 'object' && key in value) {
				value = value[key];
			} else {
				this.log.error(`Global 中没有找到路径: ${path}`);
				return null;
			}
		}
		
		return value;
	}

	/**
	 * 设置指定路径的配置值（可选，用于兼容旧代码）
	 * @static
	 * @param {string} path - 配置路径，如 'system.status'
	 * @param {any} value - 要设置的新值
	 */
	static setKey(path, value) {
		const keys = path.split('.');
		let obj = this.config;
		
		// 遍历到最后一个键的父对象
		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			if (obj && typeof obj === 'object' && key in obj) {
				obj = obj[key];
			} else {
				this.log.error(`Global 中没有找到路径: ${path}`);
				return;
			}
		}
		// 设置最后一个键的值
		const lastKey = keys[keys.length - 1];
		obj[lastKey] = value;
	}
	// /**
	//  * 清空配置，将所有值恢复为初始默认值或 null
	//  * 并同步更新到 GM 存储
	//  */
	// static clearConfig() {
	// 	const clearObj = (obj, parentKey = '') => {
	// 		for (const key in obj) {
	// 			const fullKey = parentKey ? `${parentKey}.${key}` : key;

	// 			if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
	// 				clearObj(obj[key], fullKey); // 递归清空嵌套对象
	// 			} else {
	// 				// 重置值为 null
	// 				obj[key] = null;
	// 				GM.SetValue(fullKey, null);
	// 				this.log.log(`已清空配置: ${fullKey}`);
	// 			}
	// 		}
	// 	};

	// 	clearObj(this.config);
	// 	this.log.log("全局配置已全部清空");
	// }
}