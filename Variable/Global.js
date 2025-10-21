class Global {
	// w2_user_id: 'lingboweibu(beijing)kejiyouxiangongsi_1101488685013168128',
	// w2_user_password: 'c3uDfDbKTUICcOoG',
	// w2_email_api_id_account_setting_input: '10008362',
	// w2_email_api_secret_account_setting_input: '1d0c8fec499fb7057027e09fc4662fb0',
	// w2_email_api_address_account_setting_input: '1778751963@qq.com', 
	// w2_email_api_pop3_auth_code_account_setting_input: 'rjkiywoldplaceca',
	static config = {
		cache: {},
		system: {
			system_status: false,
			system_operating_status: false,
			system_running_time: 0,
		},
		w2: {
			// 登录信息
			w2_user_name: null,
			w2_user_password: null,
			w2_email_api_id: null,
			w2_email_api_secret: null,
			w2_email_api_address: null,
			w2_email_api_pop3_auth_code: null,
			// 登录验证码
			w2_email_api_verify_code: null,
			w2_personal_informat: null, // 个人信息
			w2_token: null,
			w2_tenant_token: null,
			// 登录信息
			w2_login_status: null,
			w2_check_in_out_status: null, // 考勤打卡状态
			w2_meal_working_status: null, // 工作时长状态
			w2_current_time_line_task_status: null, // 定时打卡任务, 当前任务选项卡
			// 任务状态
			w2_token_check_task: false,
			w2_personal_status_task: false,
			w2_login_status_task: false, // 登录状态任务
			w2_working_status_task: false, // 考勤打卡任务
			w2_work_hour_status_task: false, // 工作时长任务
			w2_current_task_status_task: false, // 当前任务任务
			w2_calendar_container_task: false, // 日历任务
			// 模块设置
			w2_time_range_login_start: "08:50:00",
			w2_time_range_login_end: "08:50:00",
			w2_time_range_check_in_start: "08:55:00",
			w2_time_range_check_in_end: "08:55:00",
			w2_time_range_meal_start: "12:00:00",
			w2_time_range_meal_end: "12:00:00",
			w2_time_range_working_start: "13:30:00",
			w2_time_range_working_end: "13:30:00",
			w2_time_range_check_out_start: "18:30:00",
			w2_time_range_check_out_end: "18:30:00",
			w2_time_range_login_out_start: "18:35:00",
			w2_time_range_login_out_end: "18:35:00",
		},
		ui: {},
	};
	
	static value = {
		// 累加器 && 标志位
		// 待优化: 可以用别的方法实现Setting类中的刷新定时任务的功能, 目前用这个标志位太捞了
		w2_current_task_flag: true, // 定时任务标志位, 当它为true时, 表示定时任务中callback需要更新
		month: Time.getCurrentMonth(), // 当前月份
	}
	static w2_TaskConfig = {
		W2_LOGIN_TASK: "W2_LOGIN_TASK",
		W2_CHECK_IN_TASK: "W2_CHECK_IN_TASK",
		W2_MEAL_TASK: "W2_MEAL_TASK",
		W2_WORKING_TASK: "W2_WORKING_TASK",
		W2_CURRENT_TASK: "W2_CURRENT_TASK",
		W2_CALENDAR_TASK: "W2_CALENDAR_TASK",
	}
	static log = new Logger("Global");

	static init() {
		this.traverseConfig(this.config);
		this.setupConfigProxy(); // 初始化代理
	}

	static traverseConfig(configObj, parentKey = '') {
		for (const key in configObj) {
			const fullKey = parentKey ? `${parentKey}.${key}` : key;
			if (typeof configObj[key] === 'object' && configObj[key] !== null && !Array.isArray(configObj[key])) {
				this.traverseConfig(configObj[key], fullKey);
			} else {
				const storedValue = GM.GetValue(fullKey);
				if (storedValue !== undefined) {
					configObj[key] = storedValue;
					this.log.log(`已从存储加载配置: ${fullKey}`);
				} else {
					GM.SetValue(fullKey, configObj[key]);
					this.log.log(`已初始化配置: ${fullKey} = ${configObj[key]}`);
				}
			}
		}
	}

	static setupConfigProxy() {
		// 递归为对象及所有嵌套对象创建代理（核心修复点）
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
	 * @param {string} path - 配置路径，如 'system.system_status'
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
	 * @param {string} path - 配置路径，如 'system.system_status'
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
}