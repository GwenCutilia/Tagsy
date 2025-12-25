class ApiboxApi extends HttpRequest {
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
	static async getMailList() {
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