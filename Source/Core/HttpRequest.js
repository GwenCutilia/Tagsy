class HttpRequest {
	static log = new Logger("HttpRequest");
	/**
	 * 静态异步请求方法, 基于 GM.XmlhttpRequest 封装
	 * @param {Object} options - 请求配置对象
	 * @param {string} options.url - 请求URL
	 * @param {string} [options.method="GET"] - HTTP请求方法
	 * @param {Object} [options.headers={}] - 请求头对象
	 * @param {any} [options.data=null] - 请求体数据
	 * @param {string} [options.responseType="json"] - 响应类型
	 * @returns {Promise<any>} 返回请求结果的Promise
	 */
	static async fetch(options) {
		return new Promise((resolve, reject) => {
			let data = options.data;
			const headers = options.headers || {};
			const contentType = headers["Content-Type"] || headers["content-type"] || "";

			// 处理 request body
			if (data && typeof data === "object" && !(data instanceof FormData)) {
				// 表单提交
				if (contentType.includes("application/x-www-form-urlencoded")) {
					data = new URLSearchParams(data).toString();
				}
				// JSON 提交
				else if (contentType.includes("application/json")) {
					data = JSON.stringify(data);
					headers["Content-Type"] = "application/json;charset=UTF-8";
				}
			}

			GM.XmlhttpRequest({
				method: options.method || "GET",
				url: options.url,
				headers,
				data: data || null,
				responseType: "text",
				onload(resp) {
					try {
						let text = resp.responseText;

						// 只对 JSON 做处理
						if (text && (text.startsWith("{") || text.startsWith("["))) {
							// 把 16 位以上数字包成字符串，防止精度丢失
							text = text.replace(
								/(:\s*)(\d{16,})(?=[,\}])/g,
								'$1"$2"'
							);
							resolve(JSON.parse(text));
						} else {
							resolve(text);
						}
					} catch (e) {
						reject(e);
					}
				},
				onerror(err) {
					reject(err);
				}
			});
		});
	}
	
	/**
	 * 静态GET快捷方法
	 */
	static get(url, headers = {}) {
		return this.fetch({ url, method: "GET", headers });
	}

	/**
	 * 静态POST快捷方法
	 */
	static post(url, data = {}, headers = {}) {
		return this.fetch({ url, method: "POST", headers, data });
	}
}