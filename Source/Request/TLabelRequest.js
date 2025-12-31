class TLabelRequrst extends HttpRequest {

}
class TLabelApi extends HttpRequest {
static log = new Logger("QLabelApi");
	// TLabel Api
	static tConfig = {
		baseUrl: "https://tlabel.tencent.com/api/",
		defaultHeader: {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
		}
	}
	// 退出登录
	static async logout() {
		const url = "https://tlabel.tencent.com/api/v1/passport/logout";
		const headers = {
			...this.tConfig.defaultHeader,
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
			...this.tConfig.defaultHeader,
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
			...this.tConfig.defaultHeader,
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
			...this.tConfig.defaultHeader,
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
