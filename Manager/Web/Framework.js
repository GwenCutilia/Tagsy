// 界面逻辑
class Framework extends Page {
	// 框架初始化
	// 通用动画效果
	constructor() {
		super();
		if (!DomHelper.exists("#user_avatar")) {
			return;
		}
		Framework.init();
		Framework.updateUIElement();
		Framework.addInteraction();
		Framework.bindEvents();
	}
	static async init() {
		await this.initValue();
		await this.initTask();
	}
	static async initTask() {
		this.avatarImg();
		this.getNotice();
		this.modelStatus();
	}
	static updateUIElement() {
		let task = [
			{
				action: async () => {
					this.getNotice();
				},
				intervalMs: 1000 * 60 * 3,
				name: "FRAMEWORK_GET_NOTICE_TASK"
			},
			{
				action: async () => {
					this.modelStatus();
				},
				intervalMs: 1000 * 10,
				name: "FRAMEWORK_MODEL_STATUS_TASK"
			}
		]
		task.forEach(cofig => {
			TimerScheduler.setIntervalTask(
				cofig.action,
				cofig.intervalMs,
				cofig.name
			);
		});
	}
	static addInteraction() {
		this.addFrameworkAuxiliaryLogic();
		this.weatherComponent();
		this.addAanimationEffect();
	}
	static bindEvents() {
		
	}
	static async initValue() {
		// 顶部导航栏
		if (!DomHelper.exists("#user_avatar")) {
			return;
		}
		this.domMap = FrameworkGlobal.domMap;
		Object.entries(this.domMap).forEach(([key, selectorDomID]) => {
			this[key] = DomHelper.bySelector(selectorDomID);
		});
	}
	// static sidebarHighlight() {
	// 	const menuList = document.querySelectorAll("#sidebar_menu a");
	// 	if (!menuList || menuList.length === 0) return;

	// 	// 当前访问的文件名
	// 	let path = location.pathname.split("/").pop(); // 例如 "Index.html"

	// 	menuList.forEach(a => {
	// 		let href = a.getAttribute("href");
	// 		if (!href) return;

	// 		// 精确匹配文件名
	// 		if (href === path) {
	// 			a.className =
	// 				"flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 text-blue-600 font-semibold bg-blue-100";
	// 		} else {
	// 			a.className =
	// 				"flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700";
	// 		}
	// 	});
	// }
	// 页面加载后取消遮罩
	static async AllLoadedUIElement() {
		this.main_loading.classList.add("hidden");
	}
	// 添加框架辅助逻辑
	static async addFrameworkAuxiliaryLogic() {
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

		DomHelper.allBySelector("*").forEach(el => {
			// 排除按钮、输入框、链接、textarea、select
			if (!["BUTTON", "INPUT", "TEXTAREA", "SELECT", "A"].includes(el.tagName)) {
				el.classList.add("select-none");
			}
		});
	}
	static addAanimationEffect() {
		this.noticePanelAnimation();
	}
	// 消息面板动画
	static noticePanelAnimation() {
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
			// 新通知 → 图标变动 + 动画
			notice_i.classList.remove("fa-bell");
			notice_i.classList.add("fa-bell-ring", "fa-shake");

			// 显示提示条
			notice_div.classList.remove("hidden");
		}

		// 点击提示条 → 清除动画并写入缓存
		notice_div.addEventListener("click", () => {
			notice_i.classList.remove("fa-shake", "fa-bell-ring");
			notice_i.classList.add("fa-bell");
			FrameworkGlobal.cache.notice.content = latest;
		});
	}

	static async modelStatus() {
		const model_status_w2_i = this.model_status_w2_i;
		const model_status_w2_loading = this.model_status_w2_loading;
		const model_status_w2_label = this.model_status_w2_label;
		const model_status_ls_i = this.model_status_ls_i;
		const model_status_ls_loading = this.model_status_ls_loading;
		const model_status_ls_label = this.model_status_ls_label;

		// W2 status
		if (W2Global.status.login === W2Global.statusMap.loginStatus.login_success) {
			this.setStatus({
				icon: model_status_w2_i,
				loading: model_status_w2_loading,
				label: model_status_w2_label,
				success: true,
				text: W2Global.status.current_time_line
			});
		} else {
			this.setStatus({
				icon: model_status_w2_i,
				loading: model_status_w2_loading,
				label: model_status_w2_label,
				success: false
			});
		}

		// LS status
		if (LSGlobal.status.login === LSGlobal.statusMap.loginStatus.success) {
			let result = await LSRequest.getDailyReportList();
			LSGlobal.cache.dailyReport.list = result;

			let isToday = Time.isSameDay(result.rows[0].recordTime, Time.getCurrentDate());
			let text = isToday
				? LSGlobal.statusMap.dailyReportStatus.already
				: LSGlobal.statusMap.dailyReportStatus.not;

			this.setStatus({
				icon: model_status_ls_i,
				loading: model_status_ls_loading,
				label: model_status_ls_label,
				success: true,
				text
			});
		} else {
			this.setStatus({
				icon: model_status_ls_i,
				loading: model_status_ls_loading,
				label: model_status_ls_label,
				success: false
			});
		}
	}

	static async weatherComponent() {
		const weatherIconMap = {
			"晴": "fa-sun",
			"多云": "fa-cloud-sun",
			"阴": "fa-cloud",
			"雨": "fa-cloud-rain",
			"雪": "fa-snowflake",
			"雾": "fa-smog",
			"风": "fa-wind"
		};
		
		let result = await ApiboxRequest.getWeatherInfo();
		let data = result;
		console.log(result);
		if (result.code === 200) {
			let weatherName = data.weather1 || "晴";
			let iconClass = weatherIconMap[weatherName] || "fa-sun";
			
			this.weather_message_box.classList.add("hidden");
			this.weather_div.classList.remove("hidden");
			this.weather_icon.classList.replace("fa-sun", iconClass);
			this.weather_temp_label.textContent = data.nowinfo.temperature + "℃";
			this.weather_city_label.textContent = data.shi;
			this.weather_wind_label.textContent = data.nowinfo.windDirection + " " + data.nowinfo.windScale;
		} else {
			this.weather_message_box.innerText = "Apibox接口异常, 检查Apibox设置";
		}
	}
	static avatarImg() {
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