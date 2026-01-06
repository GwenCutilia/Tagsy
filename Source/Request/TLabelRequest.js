class TLabelRequest extends HttpRequest {
	// 登录流程
	static async loginProcess() {
		if (!await DesktopRequset.isServiceRunning()) {
			this.log.log("未开启服务, 正在开启服务");
			await DesktopRequset.startService();
		}
		await DesktopRequset.startWatch();
		await TLabelRequest.checkLogin();
		await TLabelRequest.verifyLogin();
		await DesktopRequset.stopWatch();
		await TLabelRequest.openCallbackPage();
	}
	// 发起登录
	static async checkLogin() {
		const result = await TLabelApi.initiateLogin();
		this.log.log("TLabelRequest => checkLogin result: ", result);
		// this.log.log("TLabelRequest => checkLogin result.jsdata.authorize_uuid: ", result.jsdata.authorize_uuid);
		if (result.errcode === 0) {
			TLabelGlobal.cache.information.login.uuid = result.jsdata.authorize_uuid;
			return true;
		} else {
			return false;
		}
	}
	// 验证登录
	static async verifyLogin() {
		const result = await TLabelApi.verifyLogin();
		if (result.errcode === 0) {
			TLabelGlobal.cache.information.login.callBackUrl = result.jsdata.redirect_url;
			return true;
		} else {
			return false;
		}
	}
	// 给服务发请求使其点击确定按钮
	static async sendLocalServer() {
		await DesktopRequset.clickWeChat();
	}
	// 打开callback的网页, 让服务器给浏览器设置cookie
	// 这里要访问一下callback的网页, 可以参考W2的逻辑
	// 访问已经登录的页面, 并且获取cookie
	static async openCallbackPage() {
        const url = TLabelGlobal.cache.information.login.callBackUrl;
        
        if (!url) {
            this.log.error("未找到回调地址");
            return;
        }

        // 1. 打开后台标签页
        const tabObj = GM.OpenInTab(url, {
            active: false,    // 后台打开
            insert: true,
            setParent: true
        });

        // 2. 【这里直接调用你的函数】等待 3 秒
        await Delay.sleepSeconds(3);

        // 3. 3秒后继续执行关闭逻辑
        if (tabObj && typeof tabObj.close === 'function') {
            tabObj.close();
            this.log.log("后台临时标签页已自动销毁");
        } else {
            this.log.log("无法自动关闭，请检查油猴设置");
        }
		// static async getTLCookie() {
			// // 获取 SESSION cookie
			const details = { url: "https://tlabel.tencent.com/" };
			GM.Cookie.list(details, (cookies) => {
				QLabelEngineGlobal.cache.cookie.local.sessionId = cookies[0].value;
			});
		// }
        return true;
	}

	// 可以定时发送查询登录状态来确定是否cookie过期
	// 获取个人状态(签到, 前往用餐等)
	static async getPersonalStatus() {
		const result = await TLabelApi.getPersonalStatus();
		if (result.message === "success") {
			return true;
		} else {
			return false;
		}
	}
	// 签到和签退逻辑
	static async checkIn() {
		const result = await TLabelApi.checkIn();
		if (result.message === "success") {
			Message.notify({ body: " TL 签到成功" });
			this.log.log("TL签到成功");
			return true;
		} else {
			Message.notify({ body: " TL 签到失败" });
			this.log.log("TL签到失败");
			return false;
		}
	}
	static async checkOut() {
		const result = await TLabelApi.checkOut();
		if (result.message === "success") {
			Message.notify({ body: " TL 签退成功" });
			this.log.log("TL签退成功");
			return true;
		} else {
			Message.notify({ body: " TL 签退失败" });
			this.log.log("TL签退失败");
			return false;
		}
	}
	// 吃饭和不吃饭的逻辑
	static async meal() {
		const result = await TLabelApi.meal();
		if (result.message === "success") {
			Message.notify({ body: " TL 前往用餐成功" });
			this.log.log("TL前往用餐成功");
			return true;
		} else {
			Message.notify({ body: " TL 前往用餐失败" });
			this.log.log("TL前往用餐失败");
			return false;
		}
	}
	static async work() {
		const result = await TLabelApi.work();
		this.log.log("TLR -> work => result: ", result);
		if (result.message === "success") {
			Message.notify({ body: " TL 切换标注成功" });
			this.log.log("TL切换标注成功");
			return true;
		} else {
			Message.notify({ body: " TL 切换标注失败" });
			this.log.log("TL切换标注失败");
			return false;
		}
	}
	// 退出登录
	static async logOut() {
		const result = await TLabelApi.logOut();
		if (result.message === "success") {
			Message.notify({ body: " TL 退出登录成功" });
			this.log.log("TL退出登录成功");
			return true;
		} else {
			Message.notify({ body: " TL 退出登录失败" });
			this.log.log("TL退出登录失败");
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
	static async logOut() {
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
	static async checkIn() {
		return await this.checkInOut("check_in");
	}
	static async checkOut() {
		return await this.checkInOut("check_out");
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
		const result = await this.setWorkStatus(work);
		return result;
	}
	static async meal() {
		let meal = "meal";
		const result = await this.setWorkStatus(meal);
		return result;
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
	static async _request(method, url, headers, data) {
		return await super.fetch({
			method,
			url,
			headers,
			data,
			responseType: "json",
		});
	}
}
