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