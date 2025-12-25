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