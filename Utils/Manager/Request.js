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
			mail: Global.config.w2.w2_email_api_address,
			pwd: Global.config.w2.w2_email_api_pop3_auth_code,
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
	static async login() {
		const url = this.CONFIG.BASE_URL + "/user_center/login";
		const headers = this.CONFIG.DEFAULT_HEADERS;

		const data = this._buildAuthData({
			login_type: 4,
			rand_str: "HYWmN2JLmqJAEKF1Y9wzSFduiCFQEmtS",
			verify_code: Global.config.w2.w2_email_api_verify_code
		});

		const result = await this._request("POST", url, headers, data);
		
		// 保存token
		Global.config.w2.w2_token = result.data.token;
		Global.config.w2.w2_tenant_token = result.data.tenant_token;

		return result;
	}
	// 退出登录
	static async loginOut() {
		const url = this.CONFIG.BASE_URL + "/user_center/login_out";
		const headers = this.CONFIG.DEFAULT_HEADERS;

		const data = {
			header: this._buildHeader({
				staff: Global.config.w2.w2_user_name
			})
		};

		const result = await this._request("POST", url, headers, data);
		this.log.log("logout result: ", result);
		return result;
	}
	// 获取心跳检查
	static async loginCheck() {
		const url = this.CONFIG.BASE_URL + "/user_center/login_check";
		const headers = this.CONFIG.DEFAULT_HEADERS;
		const data = {
			staff: Global.config.w2.w2_user_name,
			header: this._buildHeader()
		};
		
		return await this._request("POST", url, headers, data);
	}
	// 打卡 - 使用当前时间
	static async checkIn() {
		return await this._checkInOut("check_in");
	}
	// 下班 - 使用当前时间
	static async checkOut() {
		return await this._checkInOut("check_out");
	}

	static async _checkInOut(eventType) {
		const url = this.CONFIG.BASE_URL + "/intelligent_label_omp/check_in_out";
		const headers = this.CONFIG.DEFAULT_HEADERS;

		let eventTimestamp;
		if (eventType === "check_in") {
			eventTimestamp = Time.generateRandomTimestampInRange(
				Global.config.w2.w2_time_range_check_in_start, 
				Global.config.w2.w2_time_range_check_in_end
			);
		} else if (eventType === "check_out") {
			eventTimestamp = Time.generateRandomTimestampInRange(
				Global.config.w2.w2_time_range_check_out_start, 
				Global.config.w2.w2_time_range_check_out_end
			);
		} else {
			eventTimestamp = Math.floor(Date.now() / 1000);
		}

		const data = {
			event_datetime: eventTimestamp,
			event_type: eventType,
			header: this._buildHeader()
		};

		const result = await this._request("POST", url, headers, data);
		this.log.debug("data: ", data);
		this.log.log(eventType + " result: ", result);
		return result;
	}
	// 前往用餐
	static async meal() {
		return await this._mealWorkingStatus("meal");
	}
	// 前往工作
	static async working() {
		return await this._mealWorkingStatus("working");
	}

	static async _mealWorkingStatus(type) {
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
	static async queryPersonalSchedule() {
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
			staff: Global.config.w2.w2_user_name,
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
			username: Global.config.w2.w2_user_name,
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
	static async login() {
		const url = "http://biaoju.labelvibe.com:8088/prod-api/login";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8"
		};
		const data = {
			username: Global.config.ls.ls_user_name,
			password: Global.config.ls.ls_user_password
		};

		const result = await this._request("POST", url, headers, data);
		this.log.log("login result: ", result);
		if (result.code === 200) {
			Global.config.ls.ls_token = result.token;
		} else {

		}
		return result;
	}
	static async getPersonalInformat() {
		const url = "http://biaoju.labelvibe.com:8088/prod-api/project/task/sub/list";

		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"Authorization": "Bearer " + Global.config.ls.ls_token,
			"Cookie": "Admin-Token=" + Global.config.ls.ls_token
		}

		const data = {
			"pageNum": 1,
			"pageSize": 10,
			"taskName": "",
			"taskType": ""
		}

		const result = await this._request("POST", url, headers, data);
		this.log.log("getPersonalInformat result: ", result);
		if (result.code === 200) {
			Global.config.ls.ls_sub_task_id = result.rows[0].subTaskId;
		} else {

		}
		return result;
	}
	// 日报打卡
	static async dacCar() {
		const url = "http://biaoju.labelvibe.com:8088/prod-api/project/task/record";

		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"Authorization": "Bearer " + Global.config.ls.ls_token,
			"Cookie": "Admin-Token=" + Global.config.ls.ls_token
		};
		const data = {
			"workCount": [
				{
					"settlementUnit": "人天",
					"dataCount": "1"
				}
			],
			"checkWorkCount": [
				{
					"settlementUnit": "人天",
					"dataCount": "0"
				}
			],
			"account": Global.config.ls.ls_user_name,
			"recordTime": Time.generateISOTimestamp(undefined, 16, -1),
			"subTaskId": Global.config.ls.ls_sub_task_id,
			"platform": "企鹅标注-在线标注平台",
			"workHours": "8"
		}
		const result = await this._request("POST", url, headers, data);
		this.log.log("dacCar result: ", result);
		return result;
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