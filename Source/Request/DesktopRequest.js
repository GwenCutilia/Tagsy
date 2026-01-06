class DesktopRequset extends HttpRequest {
	static log = new Logger("DesktopRequest");
	static async startWatch() {
		// await Delay.sleepSeconds(3); // 待优化, 让它一出来就点击, 而不是延迟点击
		const result = await DesktopApi.startWatch();
		if (result.success) {
			return true;
		} else {
			return false;
		}
	}
	static async stopWatch() {
		const result = await DesktopApi.stopWatch();
		if (result.success) {
			return true;
		} else {
			return false;
		}
	}
	static async isServiceRunning() {
		const result = await DesktopApi.isServiceRunning();
		if (result.success) {
			this.log.log("服务正在运行");
			return true;
		} else {
			this.log.log("服务未启动");
			return false;
		}
	}
	static async killService() {
		const result = await DesktopApi.killService();
		if (result.success) {
			this.log.log("服务已关闭");
			return true;
		} else {
			this.log.log("服务未关闭");
		}
	}
	static async startService() {
		await DesktopApi.startService();
		let retryCount = 0; // 重试次数
		while (!await this.isServiceRunning() && retryCount < 15) {
			await Delay.sleepSeconds(1);
			retryCount++;
		}
		if (await this.isServiceRunning()) {
            this.log.log("服务已启动");
            return true;
        } else {
			Message.notify({ body: "启动失败: 等待 15 秒后服务仍未响应" });
            this.log.warn("启动失败: 等待 15 秒后服务仍未响应");
            return false;
        }
	}
}
class DesktopApi extends HttpRequest {
	static log = new Logger("DesktopApi");
	// 自动点击微信的确定按钮(巡逻机制)
	static async startWatch() {
		const url = "http://localhost:5555/start";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
		}
		const result = await this._request("GET", url, headers);
		this.log.log("clickWeChat result: ", result);
		return result;
	}
	// 停止巡逻
	static async stopWatch() {
		const url = "http://localhost:5555/stop";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
		}
		const result = await this._request("GET", url, headers);
		this.log.log("stopClick result: ", result);
		return result;
	}
	// 检查后台服务是否存活
	static async isServiceRunning() {
		const url = "http://localhost:5555/ping";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
		}
		const result = await this._request("GET", url, headers);
		this.log.log("clickWeChat result: ", result);
		return result;
	}
	// 杀掉后台服务
	static async killService() {
		const url = "http://localhost:5555/kill";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
		}
		const result = await this._request("GET", url, headers);
		this.log.log("killService result: ", result);
		return result;
	}
	// 启用后台服务
	static async startService() {
        // 使用隐藏 iframe 方案 (推荐)
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = "tagsy://start"; // 访问唤醒协议
        document.body.appendChild(iframe);

        // 2秒后清理 iframe，防止 DOM 堆积
        await Delay.sleepSeconds(2);
		document.body.removeChild(iframe);
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