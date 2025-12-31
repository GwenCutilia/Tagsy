class TLabelRequrst extends HttpRequest {
	// TLabel登录逻辑, 可以放到BehaviorTask中
	static async loginProcess() {
		await checkLogin();
		await sendLocalServer();
		await verifyLogin();
	}
	// 发起登录
	static async checkLogin() {
		const result = TLabelApi.initiateLogin();
		if (result.code === 200) {
			TLabelGlobal.cache.information.login.uuid = result.data.uuid;
			return true;
		} else {
			return false;
		}
	}
	// 给服务发请求使其点击确定按钮
	static async sendLocalServer() {

	}
	// 打开callback的网页, 让服务器给浏览器设置cookie
	// 验证登录
	static async verifyLogin() {
		const result = TLabelApi.verifyLogin();
		if (result.code === 200) {
			// 这里要打开callback的网页
			return true;
		} else {
			return false;
		}
	}
	// 可以定时发送查询登录状态来确定是否cookie过期
	static async getPersonalStatus() {
		const result = TLabelApi.getPersonalStatus();
		if (result.code === 200) {
			return true;
		} else {
			return false;
		}
	}
}
class TLabelApi extends HttpRequest {
	static log = new Logger("QLabelApi");
	// TLabel Api
	static config = {
		baseUrl: "https://tlabel.tencent.com/api/",
		defaultHeader: {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
		}
	}
	/******************
	***** 登录函数 *****
	*******************/
	// 发起登录
	static async initiateLogin() {
		const url = "https://localhost.weixin.qq.com:14013/api/check-login";
		const headers = {
			"Content-Type": "application/json",
		}
		const data = {
			"apiname": "qrconnectchecklogin",
			"jsdata": {
				"appid": "wx5c3821228d1c2712",
				"scope": "snsapi_login",
				"redirect_uri": "https://tlabel.tencent.com/login/wx-callback",
				"state": "889"
			}
		}
		const result = await this._request("POST", url, headers, data);
		this.log.log("checkLogin result: ", result);
		return result;
	}
	// 验证登录
	static async verifyLogin() {
		const url = "https://localhost.weixin.qq.com:14013/api/authorize";
		const headers = {
			"Content-Type": "application/json",
		}
		const data = {
			"apiname": "qrconnectfastauthorize",
			"jsdata": {
				"data": "{\"x\":780,\"y\":408.5}",
				"appid": "wx5c3821228d1c2712",
				"scope": "snsapi_login",
				"redirect_uri": "https://tlabel.tencent.com/login/wx-callback",
				"state": "369",
				"authorize_uuid": TLabelGlobal.cache.information.login.uuid
			}
		}
		const result = await this._request("POST", url, headers, data);
		this.log.log("verifyLogin result: ", result);
		return result;
	}
	// 退出登录
	static async logout() {
		const url = "https://tlabel.tencent.com/api/v1/passport/logout";
		const headers = {
			...this.config.defaultHeader,
			"Cookie": "SESSION_ID=" + QLabelEngineGlobal.cache.cookie.local.sessionId,
		}
		const result = await this._request("GET", url, headers);
		this.log.log("logout result: ", result);
		return result;
	}
	// 获取个人状态(签到, 前往用餐等)
	static async getPersonalStatus() {
		const url = "https://tlabel.tencent.com/api/v1/attendance/get_personal_information";
		const headers = {
			...this.config.defaultHeader,
			"Cookie": "SESSION_ID=" + QLabelEngineGlobal.cache.cookie.local.sessionId,
		};
		const data = {
		};
		const result = await this._request("POST", url, headers, data);
		this.log.log("getPersonalStatus result: ", result);
		return result;
	}
	// 签到或签退
	static async workIn() {
		return await this.checkInOut("work_in");
	}
	static async workOut() {
		return await this.checkInOut("work_out");
	}
	static async checkInOut(mode) {
		const url = "https://tlabel.tencent.com/api/v1/attendance/check_in_out";
		const headers = {
			...this.config.defaultHeader,
			"Cookie": "SESSION_ID=" + QLabelEngineGlobal.cache.cookie.local.sessionId,
		};
		const data = {
			"event_type": mode,
		}
		const result = await this._request("POST", url, headers, data);
		this.log.log("checkInOut result: ", result);
		return result;
	}
	// 切换状态为标注或前往用餐
	static async work() {
		let work = "working";
		return await setWorkStatus(work);
	}
	static async meal() {
		let meal = "meal";
		return await setWorkStatus(meal);
	}
	static async setWorkStatus(mode) {
		const url = "https://tlabel.tencent.com/api/v1/attendance/set_work_status";
		const headers = {
			...this.config.defaultHeader,
			"Cookie": "SESSION_ID=" + QLabelEngineGlobal.cache.cookie.local.sessionId,
		};
		const data = {
			"work_status": mode,
		}
		const result = await this._request("POST", url, headers, data);
		this.log.log("checkIset_work_statusnOut result: ", result);
		return result;
	}
}
