class W2Request extends HttpRequest {
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
		
		// 保存token
		W2Global.cache.cookie.token = result.data.token;
		W2Global.cache.cookie.tenant_token = result.data.tenant_token;
		
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
class QLabelRequest extends HttpRequest {
	static log = new Logger("QLabelLookupRequest");
	// 获取标注总量列表
	static async getTotalAnnotationsList() {
		return await this._workbenchUserWorkingReport("total_annotations");
	}
	// 获取质检总量列表
	static async getQualityInspectionList() {
		return await this._workbenchUserWorkingReport("quality_inspection");
	}
	static async _workbenchUserWorkingReport(stat_type) {
		if (stat_type == "total_annotations") {
			stat_type = 1;
		} else if (stat_type == "quality_inspection") {
			stat_type = 2;
		}
		let startTime = QLabelGlobal.setting.annotationList.lookupTime.startTime;
		let endTime = QLabelGlobal.setting.annotationList.lookupTime.endTime;
		const url = "https://qlabel.tencent.com/api/report/workbenchUserWorkingReport";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			"sw8": "1-ZjE3NGEzMTMtN2EwYS00MzE5LTgxNDEtNWQ3NjRkNDM4YmZk-YmZkODkxZDYtOTg5OC00OWFhLWExMzUtYTFlNzkyNTdlNTk1-1-YWVnaXM=-MS40My43-L3dvcmtiZW5jaC93b3JrLXRpbWU=-cWxhYmVsLnRlbmNlbnQuY29t",
			"Cookie": "SESSION=" + 
				QLabelLookupGlobal.cache.cookie.session
			};
			"; tgw_l7_route=" + 
			QLabelLookupGlobal.cache.cookie.route
		const data = {
			"jsonrpc": "2.0",
			"method": "workbenchUserWorkingReport",
			"id": 1763976310742,
			"params": {
				"page": {
					"start": 0,
					"size": 10,
					"return_total": 1
				},
				"user_id": "",
				"nick_name": "",
				"company_name": "",
				"task_id": "",
				"task_name": "",
				"team_id": "",
				"team_name": "",
				"template_level": "",
				"template_scene": "",
				"stat_type": stat_type,
				"cycle_step": 0,
				"begin_date": Time.getDateRangeByToday(startTime, endTime)[0] + " 00:00:00",
				"end_date": Time.getDateRangeByToday(startTime, endTime)[1] + " 00:00:00"
			}
		};

		const result = await this._request("POST", url, headers, data);
		this.log.log("_workbenchUserWorkingReport result: ", result);
		
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
class LSRequest extends HttpRequest {
	static log = new Logger("LSRequest");
	// 从这里继续, 写LS的请求信息
	static async login() {
		const url = "http://biaoju.labelvibe.com:8088/prod-api/login";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8"
		};
		const data = {
			username: LSGlobal.cache.information.name,
			password: LSGlobal.cache.information.password
		};

		const result = await this._request("POST", url, headers, data);
		this.log.log("login result: ", result);
		if (result.code === 200) {
			LSGlobal.cache.cookie.token = result.token;
		} else {
			this.log.error("LS login failed: ", result.message);
		}
		
		return result;
	}
	static async loginOut() {
		const url = "http://biaoju.labelvibe.com:8088/prod-api/logout";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"Authorization": "Bearer " + LSGlobal.cache.cookie.token,
			"Cookie": "Admin-Token=" + LSGlobal.cache.cookie.token
		};

		const result = await this._request("POST", url, headers);
		this.log.log("loginOut result: ", result);
		return result;
	}
	// 获取个人信息
	static async getInfo() {
		const url = "http://biaoju.labelvibe.com:8088/prod-api/getInfo";

		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"Authorization": "Bearer " + LSGlobal.cache.cookie.token,
			"Cookie": "Admin-Token=" + LSGlobal.cache.cookie.token
		}

		const result = await this._request("GET", url, headers);
		if (result.code === 200) {
			LSGlobal.cache.cookie.id = result.user.userId;
		}
		this.log.log("getInfo result: ", result);
		return result;
	}
	static async getFillDailyReportName() {
		let url = "http://biaoju.labelvibe.com:8088/prod-api/project/task/user/";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"Authorization": "Bearer " + LSGlobal.cache.cookie.token,
		}
		const allUrl = url + "account?taskId=" + LSGlobal.cache.cookie.task_id + "&platform=企鹅标注-在线标注平台";
		const result = await this._request("GET", allUrl, headers);
		if (result.status === 0) {
			LSGlobal.cache.cookie.name = result.data[0].name;
		} else {
			this.log.error("getFillDailyReportName failed: ", result);
		}
		this.log.log("getFillDailyReportName result: ", result);
		return result;
	}
	// 获取项目工作区信息
	static async getPersonalInformat() {
		const url = "http://biaoju.labelvibe.com:8088/prod-api/project/task/sub/list";

		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"Authorization": "Bearer " + LSGlobal.cache.cookie.token,
			"Cookie": "Admin-Token=" + LSGlobal.cache.cookie.token
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
			LSGlobal.cache.cookie.sub_task_id = result.rows[0].subTaskId;
			LSGlobal.cache.cookie.task_id = result.rows[0].taskId;
		} else {

		}
		return result;
	}
	// 填写日报
	static async fillDailyReport() {
		const url = "http://biaoju.labelvibe.com:8088/prod-api/project/task/record";

		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"Authorization": "Bearer " + LSGlobal.cache.cookie.token,
			"Cookie": "Admin-Token=" + LSGlobal.cache.cookie.token
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
			"account": LSGlobal.cache.cookie.name,
			"recordTime": Time.generateISOTimestamp(undefined, 16, -1),
			"subTaskId": LSGlobal.cache.cookie.sub_task_id,
			"platform": "企鹅标注-在线标注平台",
			"workHours": "8"
		}
		const result = await this._request("POST", url, headers, data);
		this.log.log("fillDailyReport result: ", result);
		return result;
	}
	// 获取日报列表
	static async getDailyReportList() {
		const url = "http://biaoju.labelvibe.com:8088/prod-api/project/task/person/count";

		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"Authorization": "Bearer " + LSGlobal.cache.cookie.token,
			"Cookie": "Admin-Token=" + LSGlobal.cache.cookie.token
		}

		const data = {
			"taskId": LSGlobal.cache.cookie.task_id,
			"pageSize": LSGlobal.setting.daily_report_page_size,
			"pageNum": LSGlobal.setting.daily_report_page_num,
			"recordDate": "",
			"userId": LSGlobal.cache.cookie.id
		}
		// const data = {
		// 	"taskId": "459",
		// 	"pageSize": 10,
		// 	"pageNum": 1,
		// 	"recordDate": "",
		// 	"userId": "1149"
		// }

		const result = await this._request("POST", url, headers, data);
		// this.log.log("getDailyReportList result: ", result);
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
class ApiboxRequest extends HttpRequest {
	static log = new Logger("ApiboxRequest");
	static CONFIG = {
		URL: "https://cn.apihz.cn/",
		HEADERS: {
			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
		}
	};
	static async getInfo() {
		const url = this.CONFIG.URL + "api/xitong/info.php";
		const headers = this.CONFIG.HEADERS;
		const data = {
			id: ApiboxGlobal.cache.information.id,
			key: ApiboxGlobal.cache.information.key,
		}
		const result = await this._request("POST", url, headers, data);
		this.log.log("getInfo result: ", result);
		return result;
	}
	// 获取二维码
	static async getQrCode() {

		const url = this.CONFIG.URL + "api/user/jhdl.php";

		const headers = this.CONFIG.HEADERS

		const data = {
			id: "10008362",
			key: "1d0c8fec499fb7057027e09fc4662fb0",
			type: "1",
		}

		const result = await this._request("POST", url, headers, data);
		this.log.log("getQrCode result: ", result);
		let retResult;
		if (result.code === 200) {
			//储存这两个字段
			//result.logqrcode;
			//result.cxid;
		}
		return result;
	}
	// 查询登录
	static async queryLogin() {
		const url = this.CONFIG.URL + "api/user/jhdlq.php";

		const headers = this.CONFIG.HEADERS

		const data = {
			id: "10008362",
			key: "1d0c8fec499fb7057027e09fc4662fb0",
			cxid: LoginGlobal.cache.cookie.query_id,
		}
		const result = await this._request("POST", url, headers, data);
		this.log.log("queryLogin result: ", result);
		return result;
	}
	// 验证登录
	static async verifyLogin() {
		const url = this.CONFIG.URL + "/api/user/jhdly.php";

		const headers = this.CONFIG.HEADERS

		const data = {
			id: "10008362",
			key: "1d0c8fec499fb7057027e09fc4662fb0",
			type: "1",
			socialuid: LoginGlobal.cache.cookie.uid
		};

		const result = await this._request("POST", url, headers, data);
		this.log.log("verifyLogin result: ", result);
		if (result.code === 200) {

		} else {

		}
		return result;
	}
	// 注册账号
	static async regAccount() {
		const url = this.CONFIG.URL + "/api/user/reg.php";

		const headers = this.CONFIG.HEADERS

		const data = {
			id: "10008362",
			key: "1d0c8fec499fb7057027e09fc4662fb0",
			name: LoginGlobal.cache.information.name,
			pwd: LoginGlobal.cache.information.password,
		};

		const result = await this._request("POST", url, headers, data);
		this.log.log("regAccount result: ", result);
		if (result.code === 200) {

		} else {
			if (result.msg.includes("该用户名已被注册")) {
				result.code = 500;
			}
		}
		return result;
	}
	// 登录账号
		static async loginAccount() {
		const url = this.CONFIG.URL + "/api/user/login.php";

		const headers = this.CONFIG.HEADERS

		const data = {
			id: "10008362",
			key: "1d0c8fec499fb7057027e09fc4662fb0",
			name: LoginGlobal.cache.information.name,
			pwd: LoginGlobal.cache.information.password,
		};

		const result = await this._request("POST", url, headers, data);
		this.log.log("loginAccount result: ", result);
		if (result.code === 200) {

		} else {

		}
		return result;
	}
	// 绑定账号
	static async bindAccount() {
		const url = this.CONFIG.URL + "/api/user/jhdlb.php";

		const headers = this.CONFIG.HEADERS

		const data = {
			id: "10008362",
			key: "1d0c8fec499fb7057027e09fc4662fb0",
			type: "1",
			username: LoginGlobal.cache.information.name,
			pwd: LoginGlobal.cache.information.password,
			nickname: LoginGlobal.cache.cookie.nick_name,
			socialuid: LoginGlobal.cache.cookie.uid
		};

		const result = await this._request("POST", url, headers, data);
		this.log.log("bindAccount result: ", result);
		if (result.code === 200) {

		} else {

		}
		return result;
	}
	static async getEmailApi() {
		const url = this.CONFIG.URL + "api/mail/getmaillist.php";

		const headers = this.CONFIG.HEADERS

		const data = {
			id: ApiboxGlobal.cache.information.id,
			key: ApiboxGlobal.cache.information.key,
			mail: W2Global.cache.information.address,
			pwd: W2Global.cache.information.pop3_auth_code,
			popimap: "pop3",
			ip: "pop.qq.com",
			port: "995",
			ssl: "ssl",
			page: "1",
			num: "1",
		};

		const result = await this._request("POST", url, headers, data);
		return result;
	}
	// 天气
	static async getWeatherInfo() {
		const url = this.CONFIG.URL + "/api/tianqi/tqybip.php";

		const headers = this.CONFIG.HEADERS;

		const data = {
			id: ApiboxGlobal.cache.information.id,
			key: ApiboxGlobal.cache.information.key,
		}
		const result = await this._request("POST", url, headers, data);
		this.log.log("getWeatherInfo result: ", result);
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

class JsonBinRequest extends HttpRequest {
	static log = new Logger("JsonBinRequest");
	static CONFIG = {
		URL: "https://api.jsonbin.io/v3/b/69185385ae596e708f5a8d76",
		HEADERS: {
			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
			"X-Master-Key": "$2a$10$leumNgyALEUN35ghDA8RD.b4RWz2CE5UzEUSJDXWTeBvVc7rRtQLe"
		}
	};
	// 获取公告内容
	static async getNotice() {
		const url = this.CONFIG.URL;

		const headers = JsonBinRequest.CONFIG.HEADERS

		const result = await this._request("GET", url, headers, {});
		this.log.log("test result: ", result);
		return result;
	}
	// 设置公告内容 重写
	static async setNotice() {
		const url = this.CONFIG.URL;

		const headers = {
			...JsonBinRequest.CONFIG.HEADERS,
			"Content-Type": "application/json"
		};

		const data = {
			"notice": FrameworkGlobal.cache.notice.content,
		}
		
		const result = await this._request("PUT", url, headers, data);
		this.log.log("test result: ", result);
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