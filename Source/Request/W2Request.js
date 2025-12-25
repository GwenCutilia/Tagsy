class W2Request extends HttpRequest {
	
	static async getVerifyCode() {
		const result = await W2Api.getVerifyCode();
		if (result.code !== 200) {
			W2Global.status.login = W2Global.statusMap.loginStatus.login_failed;
			this.log.error("获取验证码失败, 请检查账户信息");
			return false;
		}
		return true;
	}
	static async getMailList() {
		// const result = await ApiboxApi.getMailList();
		// if (result.code !== 200) {
		// 	W2Global.status.login = W2Global.statusMap.loginStatus.login_failed;
		// 	this.log.error("获取邮件失败, 请检查邮箱API信息");
		// 	return false;
		// }
		// W2Global.cache.information.mail_address = result.data.data[0].content.match(new RegExp("\\d{6}", "g"))[0];
		W2Global.cache.information.mail_address = "000000"; // 由于万维bug所以可以直接赋值验证码
		return true;
	}
	static async login() {
		const result = await W2Api.login();
		if (result.code === 200) {
			// 保存token
			W2Global.cache.cookie.token = result.data.token;
			W2Global.cache.cookie.tenant_token = result.data.tenant_token;
			return true;
		} else {
			return false;
		}
	}
	static async checkIn() {
		const result = await W2Api.checkIn();
		if (result.code === 200) {
			return true;
		} else {
			return false;
		}
	}
	static async meal() {
		const result = await W2Api.meal();
		if (result.code === 200) {
			return true;
		} else {
			return false;
		}
	}
	static async working() {
		const result = await W2Api.working();
		if (result.code === 200) {
			return true;
		} else {
			return false;
		}
	}
	static async checkOut() {
		const result = await W2Api.checkOut();
		if (result.code === 200) {
			return true;
		} else {
			return false;
		}
	}
	static async loginOut() {
		const result = await W2Api.loginOut();
		if (result.code === 200) {
			return true;
		} else {
			return false;
		}
	}
	// 获取心跳
	static async loginCheck() {
		const result = await W2Api.loginCheck();
		if (result.code === 200) {
			W2Global.status.login = W2Global.statusMap.loginStatus.login_success;
			W2Global.cache.cookie.token = result.data.token;
			return true;
		} else {
			W2Global.status.login = W2Global.statusMap.loginStatus.login_failed;
			this.log.error("Token失效, 请重新登录");
			return false;
		}
	}
	// 获取工作信息
	static async getPersonalInformat() {
		const result = await W2Api.getPersonalInformat();
		if (result.code === 200) {
			W2Global.cache.information.informat = result;
			return true;
		} else {
			return false;
		}
	}
	// 获取W2网页, 不获取会产生400错误, 要模拟浏览器打开W2页面才行
	static async getLoginPage() {
		await W2Api.getLoginPage();
	}
	// 获取日历信息
	static async queryPersonalSchedule() {
		const result = await W2Api.queryPersonalSchedule();

		if (result.code !== 200) {
			this.log.error("获取日历失败");
			return null;
		}

		const column = result.data.column || [];
		const scheduleInfos =
			result.data.detail_data_list?.[0]?.schedule_infos || {};

		return {
			column,
			scheduleInfos
		};
	}
	// 获取抽调列表
	static async getApplyApprovalList() {
		const result = await W2Api.getApplyApprovalList();

		if (result.code !== 200) {
			this.log.error("获取抽调列表失败");
			return null;
		}

		const list = result.data?.data_list || [];

		return {
			list,
			page: W2Global.setting.applyActivityTransferList.page
		};
	}
	static async qualityInspection() {
		let obj = {};
		const result = await W2Api.qualityInspection();
		if (result.code === 200) {
			return true;
		} else {
			obj.code = result.code;
			obj.msg = result.msg;
			return false;
		}
	}
	static async training() {
		const result = await W2Api.training();
		if (result.code === 200) {
			return true;
		} else {
			return false;
		}
	}
	static async applyOvertime() {
		const result = await W2Api.applyOvertime();
		if (result.code === 200) {
			return true;
		} else {
			return false;
		}
	}

}
class W2Api extends HttpRequest {
	static log = new Logger("W2Request");
	static CONFIG = {
		BASE_URL: "https://api-wanwei.myapp.com",
		DEFAULT_HEADERS: {
			"x-requested-with": "XMLHttpRequest",
			"Accept": "*/*",
			"Content-Type": "application/json;charset=UTF-8"
		}
	};

	constructor() {
		super();
	}

	// 发送W2登录验证码
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
	// 获取心跳令牌
	static async login() {
		const url = this.CONFIG.BASE_URL + "/user_center/login";
		const headers = this.CONFIG.DEFAULT_HEADERS;

		const data = this._buildAuthData({
			login_type: 4,
			rand_str: "HYWmN2JLmqJAEKF1Y9wzSFduiCFQEmtS",
			verify_code: W2Global.cache.information.mail_address
		});

		const result = await this._request("POST", url, headers, data);
		
		return result;
	}
	// 退出登录
	static async loginOut() {
		const url = this.CONFIG.BASE_URL + "/user_center/login_out";
		const headers = this.CONFIG.DEFAULT_HEADERS;

		const data = {
			header: this._buildHeader({
				staff: W2Global.cache.information.name
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
			staff: W2Global.cache.information.name,
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
				W2Global.setting.time_range_check_in_start, 
				W2Global.setting.time_range_check_in_end
			);
		} else if (eventType === "check_out") {
			eventTimestamp = Time.generateRandomTimestampInRange(
				W2Global.setting.time_range_check_out_start, 
				W2Global.setting.time_range_check_out_end
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
		this.log.log(eventType + " result: ", result);
		return result;
	}
	// 申请加班
	static async applyOvertime() {
		const url = this.CONFIG.BASE_URL + "/intelligent_label_omp/apply_overtime";
		const headers = this.CONFIG.DEFAULT_HEADERS;
		let eventTimestamp = Time.getTimeRangeTimestamp(W2Global.cache.applyActivityTransfer.time);
		const data = {
			"begin_time": eventTimestamp[0],
			"end_time": eventTimestamp[1],
			"memo": W2Global.cache.applyActivityTransfer.momo,
			"header": {
				"staff": W2Global.cache.information.name,
				"staff_id": 0,
				"oa_ticket": W2Global.cache.cookie.token,
				"tracer": "|b077b6d5cc0a68|1760692722212",
				"tenant_token": W2Global.cache.cookie.tenant_token
			}
		}
		const result = await this._request("POST", url, headers, data);
		return result;
	}
	// W2抽调
	static async qualityInspection() {
		return await this._applyActivityTransfer("quality_inspection");
	}
	static async training() {
		return await this._applyActivityTransfer("training");
	}
	static async _applyActivityTransfer(activityType) {
		const url = "https://api-wanwei.myapp.com/intelligent_label_omp/apply_activity_transfer";
		const headers = this.CONFIG.DEFAULT_HEADERS;
		let eventTimestamp = Time.getTimeRangeTimestamp(W2Global.cache.applyActivityTransfer.time);

		const data = {
			"activity_type": activityType,
			"begin_time": eventTimestamp[0],
			"end_time": eventTimestamp[1],
			"memo": W2Global.cache.applyActivityTransfer.momo,
			"header": {
				"staff": W2Global.cache.information.name,
				"staff_id": 0,
				"oa_ticket": W2Global.cache.cookie.token,
				"tracer": "|b077b6d5cc0a68|1760692722212",
				"tenant_token": W2Global.cache.cookie.tenant_token
			}
		}
		const result = await this._request("POST", url, headers, data);
		return result;
	}
	// 获取抽调列表
	static async getApplyApprovalList() {
		const url = "https://api-wanwei.myapp.com/intelligent_label_omp/get_my_apply_approval";
		const headers = this.CONFIG.DEFAULT_HEADERS;
		const data = {
			"page": W2Global.setting.applyActivityTransferList.page,
			"page_size": 3,
			"begin_date": Time.getDateRangeByToday(-10, 0)[0], // 开始查询的时间
			"end_date": Time.getDateRangeByToday(-10, 0)[1], // 结束查询的时间
			"apply_type_list": [ // 类型
				"transfer",
				"holiday",
				"overtime",
				"attendance"
			],
			"approval_status_list": [ // 状态
				"pending_approval",
				"approved_passed",
				"approved_reject"
			],
			"header": {
				"staff": W2Global.cache.information.name,
				"staff_id": 0,
				"oa_ticket": W2Global.cache.cookie.token,
				"tracer": "|b0454389a32168|1762074840048",
				"tenant_token": W2Global.cache.cookie.tenant_token
			}
		}

		const result = await this._request("POST", url, headers, data);
		// this.log.log("getApplyApprovalList result: ", result);
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
			// staff: W2Global.setting.w2_user_id,
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
			begin_date: Time.getCurrentMonthBoundary(Number(W2Global.setting.calendar.month), "beginDate"),
			end_date: Time.getCurrentMonthBoundary(Number(W2Global.setting.calendar.month), "endDate"),
			header: this._buildHeader()
		};

		const result = await this._request("POST", url, headers, data);
		// this.log.log("queryCurrentMonthSchedule result: ", result);
		return result;
	}

	// 构建请求头
	static _buildHeader(additionalData = {}) {
		return {
			staff: W2Global.cache.information.name,
			staff_id: 0,
			oa_ticket: W2Global.cache.cookie.token,
			tracer: "|7b0f57ef3ac51|1749259397196",
			tenant_token: W2Global.cache.cookie.tenant_token,
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
			username: W2Global.cache.information.name,
			password: W2Global.cache.information.password,
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