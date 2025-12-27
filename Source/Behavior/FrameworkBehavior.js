class FrameworkBehavior extends Behavior {
	static __autoRegister = Behavior._register(this);
}
class FrameworkHelperUtils extends FrameworkBehavior {
	static setStatus({
		icon = null,        // 图标元素
		loading = null,     // loading 元素
		label = null,       // 文本元素
		success = false,    // 是否成功状态
		text = null,        // label 文案
		successClass = "text-green-500",
		failClass = "text-gray-500",
	}) {
		// 切换图标颜色
		if (icon) {
			icon.classList.remove(success ? failClass : successClass);
			icon.classList.add(success ? successClass : failClass);
		}

		// 文案
		if (label && text !== null) {
			label.innerText = text;
		}

		// 控制显示和隐藏
		if (loading) {
			loading.classList.toggle("hidden", success);
		}
		if (label) {
			label.classList.toggle("hidden", !success);
		}
	}
}
class FrameworkAddAanimationEffect extends FrameworkBehavior {
	// 消息通知面板动画
	static noticePanelAnimation() {
		this.log.log(this.notice_btn);
		const noticeBtn = this.notice_btn;
		const noticePanel = this.notice_panel_div;
		const noticeClose = this.notice_close;

		let isOpen = false;

		function openNoticePanel() {
			if (isOpen) return;
			isOpen = true;

			// 显示面板并设置初始状态
			noticePanel.classList.remove("hidden");
			noticePanel.classList.add("opacity-0", "scale-95");

			// 下一帧触发动画
			requestAnimationFrame(() => {
				noticePanel.classList.remove("opacity-0", "scale-95");
				noticePanel.classList.add("opacity-100", "scale-100");
			});
		}

		function closeNoticePanel() {
			if (!isOpen) return;
			isOpen = false;

			// 收起动画
			noticePanel.classList.remove("opacity-100", "scale-100");
			noticePanel.classList.add("opacity-0", "scale-95");

			// 动画完成后隐藏
			setTimeout(() => {
				if (!isOpen) noticePanel.classList.add("hidden");
			}, 200);
		}

		noticeBtn.addEventListener("click", () => {
			isOpen ? closeNoticePanel() : openNoticePanel();
		});
		noticeClose.addEventListener("click", closeNoticePanel);
		document.addEventListener("click", (e) => {
			if (!noticeBtn.contains(e.target) && !noticePanel.contains(e.target)) {
				closeNoticePanel();
			}
		});
	}
}
class FrameworkAddAuxiliaryLogic extends FrameworkBehavior {
	static async addEffectsForButton() {
		// 按钮点击效果
		DomHelper.allBySelector('button').forEach(btn => {
			btn.addEventListener('click', () => {
				// 添加点击效果样式
				btn.classList.add('ring-2', 'ring-offset-1', 'ring-indigo-300');
				// 0.2秒后移除效果
				setTimeout(() => {
					btn.classList.remove('ring-2', 'ring-offset-1', 'ring-indigo-300');
				}, 200);
			});
		});
	}
	static async addSelectNoneClassExceptFormElements() {
		DomHelper.allBySelector("*").forEach(el => {
			// 排除按钮、输入框、链接、textarea、select
			if (!["BUTTON", "INPUT", "TEXTAREA", "SELECT", "A"].includes(el.tagName)) {
				el.classList.add("select-none");
			}
		});
	}
	// 页面跳转
	static async jumpPage() {
		if (location.pathname.endsWith("Login.html")) {
			if (LoginGlobal.status.login === true) {
				location.href = "./Index.html";
			}
			return;
		}

		if (LoginGlobal.status.login === false) {
			location.href = "./Login.html";
		}
	}
	static async AllLoadedUIElement() {
		this.main_loading.classList.add("hidden");
		this.main_area.classList.remove("hidden");
	}
}
class FrameworkUpdateUIElement extends FrameworkBehavior {
	// 头像图片
	static async avatarImg() {
		const avatarBtn = document.getElementById("user_avatar");

		// 创建 img 元素
		const img = document.createElement("img");
		img.src = LoginGlobal.cache.cookie.avatar_url;
		img.className = "w-7 h-7 rounded-full object-cover";

		// 清空原有内容
		avatarBtn.innerHTML = "";

		// 插入头像
		avatarBtn.appendChild(img);
	}
	// 获取通知
	static async getNotice() {
		const notice_i = this.notice_i;
		const notice_div = this.notice_div;
		const notice_label = this.notice_label;

		let result = await JsonBinRequest.getNotice();
		let latest = result.record.notice;
		let cached = FrameworkGlobal.cache.notice.content;

		// 更新文字
		notice_label.innerText = latest;

		// 判断是否为新通知
		let isNew = latest !== cached;

		if (isNew) {
			notice_i.classList.remove("fa-bell");
			notice_i.classList.add("fa-bell-ring", "fa-shake");
			notice_div.classList.remove("hidden");
		}

		// 只绑定一次点击事件
		if (!notice_div.__notice_click_binded) {
			notice_div.__notice_click_binded = true;

			notice_div.addEventListener("click", () => {
				notice_i.classList.remove("fa-shake", "fa-bell-ring");
				notice_i.classList.add("fa-bell");

				FrameworkGlobal.cache.notice.content = notice_label.innerText;
			});
		}
	}
	// 模块状态
	static async modelStatus() {
		const model_status_w2_i = this.model_status_w2_i;
		const model_status_w2_loading = this.model_status_w2_loading;
		const model_status_w2_label = this.model_status_w2_label;
		const model_status_ls_i = this.model_status_ls_i;
		const model_status_ls_loading = this.model_status_ls_loading;
		const model_status_ls_label = this.model_status_ls_label;

		// W2 status
		if (W2Global.status.login === W2Global.statusMap.loginStatus.login_success) {
			FrameworkHelperUtils.setStatus({
				icon: model_status_w2_i,
				loading: model_status_w2_loading,
				label: model_status_w2_label,
				success: true,
				text: W2Global.status.current_time_line ?? "--",
			});
		} else {
			FrameworkHelperUtils.setStatus({
				icon: model_status_w2_i,
				loading: model_status_w2_loading,
				label: model_status_w2_label,
				success: false
			});
		}

		// LS status
		if (LSGlobal.status.login === LSGlobal.statusMap.loginStatus.success) {
			if (await LSRequest.getDailyReportList() === false) {
				this.log.error("LSRequest.getDailyReportList() 请求失败");
			}
			let isToday = Time.isSameDay(LSGlobal.cache.dailyReport.list.rows[0].recordTime, Time.getCurrentDate());
			let text = isToday
				? LSGlobal.statusMap.dailyReportStatus.already
				: LSGlobal.statusMap.dailyReportStatus.not;

			FrameworkHelperUtils.setStatus({
				icon: model_status_ls_i,
				loading: model_status_ls_loading,
				label: model_status_ls_label,
				success: true,
				text
			});
		} else {
			FrameworkHelperUtils.setStatus({
				icon: model_status_ls_i,
				loading: model_status_ls_loading,
				label: model_status_ls_label,
				success: false
			});
		}
	}
	// 天气信息
	static async weatherComponent() {

		/* =============== 天气 → 图标 =============== */
		const weatherIconMap = {
			"晴": "fa-sun",
			"多云": "fa-cloud-sun",
			"阴": "fa-cloud",
			"雨": "fa-cloud-rain",
			"雪": "fa-snowflake",
			"雾": "fa-smog",
			"风": "fa-wind"
		};

		/* =============== 天气 → 颜色 =============== */
		const weatherColorMap = {
			"晴": "text-yellow-500",
			"多云": "text-orange-400",
			"阴": "text-gray-500",
			"雨": "text-blue-500",
			"雪": "text-sky-300",
			"雾": "text-gray-400"
		};

		/* =============== 风力 → 图标 & 深色颜色（FA Pro） =============== */
		const windIconMap = [
			{ max: 2,  icon: "fa-wind",                     color: "text-emerald-700" },
			{ max: 4,  icon: "fa-wind-warning",            color: "text-emerald-800" },
			{ max: 6,  icon: "fa-wind-circle-exclamation", color: "text-amber-700" },
			{ max: 99, icon: "fa-wind-circle-bolt",        color: "text-red-700" }
		];

		let result = await ApiboxApi.getWeatherInfo();
		console.log(result);

		/* =============== 错误处理 =============== */
		const showError = function (msg) {
			document.getElementById("weather_message_box").innerText = msg;
			document.getElementById("weather_message_box").classList.remove("hidden");
			document.getElementById("weather_div").classList.add("hidden");
		};

		if (!result || result.code !== 200) {
			showError("Apibox接口异常, 检查Apibox设置");
			return;
		}

		const data = result;
		const now = data.nowinfo || {};

		/* =============== 天气归类 =============== */
		let key = data.weather1 || "晴";

		if (key.indexOf("雨") !== -1) key = "雨";
		else if (key.indexOf("雪") !== -1) key = "雪";
		else if (key.indexOf("雾") !== -1 || key.indexOf("霾") !== -1) key = "雾";
		else if (key.indexOf("风") !== -1) key = "风";
		else if (key.indexOf("多云") !== -1) key = "多云";
		else if (key.indexOf("阴") !== -1) key = "阴";
		else key = "晴";

		/* =============== 主天气图标 =============== */
		const weatherIconClass = weatherIconMap[key] || "fa-sun";
		const weatherColorClass = weatherColorMap[key] || "text-yellow-500";

		/* =============== 风力解析（仅 new RegExp） =============== */
		let windLevel = 0;
		const windScaleText = now.windScale || "";

		const windReg = new RegExp("\\d+");
		const windMatch = windScaleText.match(windReg);

		if (windMatch) {
			windLevel = parseInt(windMatch[0], 10);
		}

		const windConfig =
			windIconMap.find(item => windLevel <= item.max) || windIconMap[0];

		/* =============== 数据 =============== */
		const temperature = now.temperature !== undefined ? now.temperature : "--";
		const city = data.shi || data.name || "未知城市";
		const windDirection = now.windDirection || "--";
		const windScale = now.windScale || "--";

		/* =============== 显示区域 =============== */
		document.getElementById("weather_message_box").classList.add("hidden");
		document.getElementById("weather_div").classList.remove("hidden");

		/* =============== 天气图标 =============== */
		const weatherIconEl = document.getElementById("weather_icon");
		weatherIconEl.className =
			"fa-duotone " + weatherIconClass + " " + weatherColorClass + " mr-2";

		/* =============== 温度 =============== */
		const tempLabel = document.getElementById("weather_temp_label");
		if (typeof temperature === "number") {
			tempLabel.textContent = Math.round(temperature) + "℃";
		} else {
			tempLabel.textContent = temperature + "℃";
		}

		/* =============== 城市 =============== */
		document.getElementById("weather_city_label").textContent = city;

		/* =============== 风图标（动态） =============== */
		const windIconEl = document.getElementById("weather_wind_icon");
		windIconEl.className =
			"fa-duotone " + windConfig.icon + " " + windConfig.color + " mr-1";

		/* =============== 风文字 =============== */
		document.getElementById("weather_wind_label").textContent =
			windDirection + " " + windScale;
	}

}