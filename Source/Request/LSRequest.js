class LSRequest extends HttpRequest {
	static async login() {
		const result = await LSApi.login();
		if (result.code === 200) {
			LSGlobal.status.login = LSGlobal.statusMap.loginStatus.success;
			LSGlobal.cache.cookie.token = result.token;
			return true;
		} else {
			LSGlobal.status.login = LSGlobal.statusMap.loginStatus.failed;
			return false;
		}
	}
	static async getPersonalInformat() {
		const result = await LSApi.getPersonalInformat();
		if (result.code === 200) {
			LSGlobal.cache.cookie.sub_task_id = result.rows[0].subTaskId;
			LSGlobal.cache.cookie.task_id = result.rows[0].taskId;
			return true;
		} else {
			return false;
		}
	}
	static async getInfo() {
		const result = await LSApi.getInfo();
		if (result.code === 200) {
			LSGlobal.cache.cookie.id = result.user.userId;
			return true;
		} else {
			return false;
		}
	}
	static async getFillDailyReportName() {
		const result = await LSApi.getFillDailyReportName();
		if (result.status === 0) {
			LSGlobal.cache.cookie.name = result.data[0].name;
			return true;
		} else {
			return false;
		}
	}
	// 退出登录
	static async loginOut() {
		const result = await LSApi.loginOut();
		if (result.code === 200) {
			LSGlobal.status.login = LSGlobal.statusMap.loginStatus.out;
			return true;
		} else {
			return false;
		}
	}
	// 心跳 如果LS又掉线的情况再做
	static async loginCheck() {
		
	}
	// 填写日报
	static async fillDailyReport() {
		let result = await LSApi.fillDailyReport();
		// 换一个别的if条件
		if (result.code === 200) {
			return true;
		} else {
			return false;
		}
	}
	// 获取日报列表
	static async getDailyReportList() {
		let result = await LSApi.getDailyReportList();
		this.log.log("getDailyReportList result: ", result);
		if (result.code === 200) {
			LSGlobal.cache.dailyReport.list = result;
			return true;
		} else {
			this.log.log("获取日报列表失败: ", result.message);
			return false;
		}
	}
}

class LSApi extends HttpRequest {
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