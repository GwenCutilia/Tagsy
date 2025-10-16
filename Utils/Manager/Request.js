class W2Request extends HttpRequest {
	static log = new Logger("W2Request");
	static CONFIG = {
		BASE_URL: "https://api-wanwei.myapp.com",
		EMAIL_API_URL: "https://cn.apihz.cn/",
		DEFAULT_HEADERS: {
			"x-requested-with": "XMLHttpRequest",
			"Accept": "*/*",
			"Content-Type": "application/json;charset=UTF-8"
		}
	};

	constructor() {
		super();
	}

	// 获取W2登录验证码
	static async getVerifyCode() {
		const url = this.CONFIG.BASE_URL + "/user_center/get_verify";
		const headers = this.CONFIG.DEFAULT_HEADERS;
		
		const data = this._buildAuthData({
			rand_str: "qQuCXww2JMLI1GtqLv2A7K2TT8VFOJEhi",
		});

		const result = await this._request("POST", url, headers, data);
		return result;
	}
	// 获取登录页面
	static async getLoginPage() {
		const url = "https://wanwei.myapp.com/login";
		return await this.fetch({
			method: "GET",
			url: url,
			headers: {},
			responseType: "text"
		});
	}
	// 获取第一封邮件
	static async getEmailApi() {
		const url = this.CONFIG.EMAIL_API_URL + "api/mail/getmaillist.php";

		const headers = {
			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
		};

		const data = {
			id: Global.config.w2.w2_email_api_id,
			key: Global.config.w2.w2_email_api_secret,
			mail: Global.config.w2.w2_email_address,
			pwd: Global.config.w2.w2_email_pop3_auth_code,
			popimap: "pop3",
			ip: "pop.qq.com",
			port: "995",
			ssl: "ssl",
			page: "1",
			num: "1",
		};

		const result = await this._request("POST", url, headers, data);
		this.log.debug("获取邮箱API结果: ", result);
		return result;
	}
	// 获取心跳令牌
	static async getToken() {
		const url = this.CONFIG.BASE_URL + "/user_center/login";
		const headers = this.CONFIG.DEFAULT_HEADERS;

		const data = this._buildAuthData({
			login_type: 4,
			rand_str: "HYWmN2JLmqJAEKF1Y9wzSFduiCFQEmtS",
			verify_code: Global.config.w2.w2_email_verify_code
		});

		const result = await this._request("POST", url, headers, data);
		
		// 保存token
		Global.config.w2.w2_token = result.data.token;
		Global.config.w2.w2_tenant_token = result.data.tenant_token;

		return result;
	}
	// 退出登录
	static async logout() {
		const url = this.CONFIG.BASE_URL + "/user_center/login_out";
		const headers = this.CONFIG.DEFAULT_HEADERS;

		const data = {
			header: this._buildHeader({
				staff: Global.config.w2.w2_user_id
			})
		};

		const result = await this._request("POST", url, headers, data);
		this.log.log("logout result: ", result);
		return result;
	}
	// 获取心跳检查
	static async getTokenCheck() {
		const url = this.CONFIG.BASE_URL + "/user_center/login_check";
		const headers = this.CONFIG.DEFAULT_HEADERS;
		const data = {
			staff: Global.config.w2.w2_user_id,
			header: this._buildHeader()
		};
		
		return await this._request("POST", url, headers, data);
	}
	// 打卡
	static async workIn() {
		return await this._checkInOut("check_in", 8, 55, 0);
	}
	// 下班
	static async workOut() {
		return await this._checkInOut("check_out", 18, 55, 0);
	}

	static async _checkInOut(eventType, hour, minute, second) {
		const url = this.CONFIG.BASE_URL + "/intelligent_label_omp/check_in_out";
		const headers = this.CONFIG.DEFAULT_HEADERS;

		const data = {
			event_datetime: Time.getTodayTimestamp(hour, minute, second),
			event_type: eventType,
			header: this._buildHeader()
		};

		const result = await this._request("POST", url, headers, data);
		this.log.log(`${eventType === "check_in" ? "workIn" : "workOut"} result: `, result);
		return result;
	}
	// 前往用餐
	static async goMeal() {
		return await this._goMealWork("meal");
	}
	// 前往工作
	static async goWork() {
		return await this._goMealWork("working");
	}

	static async _goMealWork(type) {
		const url = this.CONFIG.BASE_URL + "/intelligent_label_omp/set_work_hour_status";

		const headers = this.CONFIG.DEFAULT_HEADERS;
		const data = {
			work_hour_status: type,
			header: this._buildHeader()
		};

		const result = await this._request("POST", url, headers, data);
		this.log.log("_goMealWork result: ", result);
		return result;
	}
	// 获取工作状态
	static async getPersonalInformat() {
		const url = this.CONFIG.BASE_URL + "/intelligent_label_omp/get_personal_information";
		const headers = this.CONFIG.DEFAULT_HEADERS;
		const data = {
			// staff: Global.config.w2.w2_user_id,
			header: this._buildHeader()
		};

		return await this._request("POST", url, headers, data);
	}
	// 查询当前月份的日程
	static async queryCurrentMonthSchedule() {
		const url = this.CONFIG.BASE_URL + "/intelligent_label_omp/query_personal_schedule";
		const headers = {
			...this.CONFIG.DEFAULT_HEADERS,
			"Cookie": "env_set=label"
		};
		const data = {
			is_owner: true,
			begin_date: Time.getCurrentMonthBoundary(Number(Global.value.month), "beginDate"),
			end_date: Time.getCurrentMonthBoundary(Number(Global.value.month), "endDate"),
			header: this._buildHeader()
		};

		const result = await this._request("POST", url, headers, data);
		this.log.log("queryCurrentMonthSchedule result: ", result);
		return result;
	}

	// 构建请求头
	static _buildHeader(additionalData = {}) {
		return {
			staff: Global.config.w2.w2_user_id,
			staff_id: 0,
			oa_ticket: Global.config.w2.w2_token,
			tracer: "|7b0f57ef3ac51|1749259397196",
			tenant_token: Global.config.w2.w2_tenant_token,
			...additionalData
		};
	}

	static _generateTracer() {
		const random = Math.random().toString(36).substring(2, 10);
		const timestamp = Date.now();
		return `|${random}|${timestamp}`;
	}

	static _buildAuthData(additionalData = {}) {
		return {
			username: Global.config.w2.w2_user_id,
			password: Global.config.w2.w2_user_password,
			header: {
				staff: "",
				staff_id: 0,
				oa_ticket: "test",
				tracer: this._generateTracer(), // 使用动态生成
			},
			...additionalData
		};
	}

	static async _request(method, url, headers, data) {
		return await this.fetch({
			method,
			url,
			headers,
			data,
			responseType: "json",
		});
	}
}

class LSRequest extends HttpRequest {
	static log = new Logger("LSRequest");
	// 从这里继续, 写LS的请求信息
}