class W2 extends Page {
	constructor() {
		super();
	}
}
class W2Web extends W2 {
	constructor() {
		super();
	}

	async init() {
		this.initValue();
		this.initTask();
		this.bindEvents();
		this.updateUIElement();
		this.addAanimationEffect(); // 添加动画效果
	}
	initValue() {
		this.domMap = W2Global.domMap;
		Object.entries(this.domMap).forEach(([key, selectorDomID]) => {
			this[key] = DomHelper.bySelector(selectorDomID);
		});
	}
	async initTask() {
		await this.loginStatusTask();
		await this.workingStatusTask();
		await this.workHourStatusTask();
		await this.currentTimeLineTask();
		await this.personalStatusTask();
		await this.calendarTask();
		await this.applyActivityTransferList();
		Framework.AllLoadedUIElement();
	}
	// 登录W2
	static async login() {
		if (await this.isLoginStatus()) {
			W2Global.status.login = W2Global.statusMap.loginStatus.login_success;
			this.log.log("W2已登录, 无需重复登录");
			W2Web.loginCheck();
			return;
		}
		let result;
		this.log.log("正在进行登录W2操作...");
		W2Global.status.login = W2Global.statusMap.loginStatus.logining;
		result = await W2Request.getVerifyCode(); // 直接返回状态信息
		if (result.code !== 200) {
			W2Global.status.login = W2Global.statusMap.loginStatus.login_failed;
			this.log.error("获取验证码失败, 请检查账户信息");
			return;
		}
		this.log.log("验证码已发送, 等待接收");
		// await System.sleepSeconds(5);
		result = await ApiboxRequest.getEmailApi();
		if (result.code !== 200) {
			W2Global.status.login = W2Global.statusMap.loginStatus.login_failed;
			this.log.error("获取邮件失败, 请检查邮箱API信息");
			return;
		}
		// W2Global.cache.information.mail_address = result.data.data[0].content.match(new RegExp("\\d{6}", "g"))[0];
		W2Global.cache.information.mail_address = "000000";
		this.log.log("正在登录");
		await W2Request.login();
		this.log.log("获取心跳");
		await W2Request.loginCheck();
		W2Web.loginCheck();
		this.log.log("心跳正常, 登录成功");
	}
	// 查询是否是登录状态
	static async isLoginStatus() {
		let result = await W2Request.loginCheck();
		if (result.code === 200) {
			W2Global.cache.cookie.token = result.data.token;
			return true;
		} else {
			return false;
		}
	}
	// 心跳
	static async loginCheck() {
		let result = await W2Request.loginCheck();
		this.log.log("result: ", result);
		if (result.code === 200) {
			W2Global.cache.cookie.token = result.data.token;
			W2Global.status.login = W2Global.statusMap.loginStatus.login_success;
		} else {
			this.log.error("Token失效, 请重新登录");
			W2Global.status.login = W2Global.statusMap.loginStatus.login_failed;
		}
	}
	bindEvents() {
		this.login_btn.addEventListener("click", async () => {
			await this.login();
			await this.currentTask();
		});
		this.relogin_btn.addEventListener("click", async () => {
			 // 再写一个relogin函数
		});
		this.login_out_btn.addEventListener("click", async () => {
			await W2Request.loginOut();
			// 将UI置为默认状态
			this.check_in_out_label.innerText = W2Global.statusMap.unknown;
			this.meal_working_status_label.innerText = W2Global.statusMap.unknown;
			this.calendar_label.innerText = W2Global.statusMap.unknown;
			this.calendar_table.innerHTML = "";

			W2Global.status.login = W2Global.statusMap.loginStatus.not_login;
		});
		this.meal_working_status_btn.addEventListener("click", async () => {
			if (meal_working_status_label.innerText === "正在标注") {
				await W2Request.meal();
			} else if (meal_working_status_label.innerText === "前往用餐") {
				await W2Request.working();
			}
		});
		// 考勤打卡状态 -> 签到按钮 // 添加未登录逻辑
		this.check_in_btn.addEventListener("click", async () => {
			await W2Request.checkIn();
		});
		// 考勤打卡状态 -> 签出按钮
		this.check_out_btn.addEventListener("click", async () => {
			await W2Request.checkOut();
		});
		// 当前任务时间线 -> 开始任务按钮
		this.current_time_line_task_start_btn.addEventListener("click", async () => {
			await W2Web.currentTask();
		});
		// 当前任务时间线 -> 停止任务按钮
		this.current_time_line_task_stop_btn.addEventListener("click", async () => {
			await W2Web.stopAllTask();
		});
		this.prev_month_btn.addEventListener("click", async () => {
			W2Global.setting.calendar.month--;
			await this.calendarTask();
		});
		this.next_month_btn.addEventListener("click", async () => {
			W2Global.setting.calendar.month++;
			await this.calendarTask();
		});
		// 申请抽调按钮
		this.apply_activity_transfer_btn.addEventListener("click", async () => {
			let typeLabel = this.apply_activity_transfer_type_label.innerText;
			let timeText = this.apply_activity_transfer_time_text.value;
			let momoText = this.apply_activity_transfer_momo_text.value;
			const okTime = this.validateField({
				inputDom: this.apply_activity_transfer_time_text,
				messageBox: this.apply_activity_transfer_message_box,
				validateFn: FormatValidation.validateTime,
				errorMessage: "时间格式错误, 请重新输入"
			});

			if (!okTime) return;

			const okMomo = this.validateField({
				inputDom: this.apply_activity_transfer_momo_text,
				messageBox: this.apply_activity_transfer_message_box,
				validateFn: FormatValidation.validateMomo,
				errorMessage: "备注格式错误, 请重新输入"
			});

			if (!okMomo) return;
			W2Global.cache.applyActivityTransfer.time = this.apply_activity_transfer_time_text.value;
			W2Global.cache.applyActivityTransfer.momo = this.apply_activity_transfer_momo_text.value;
			let result;
			if (typeLabel === "抽调质检") {
				result = await W2Request.qualityInspection();
			} else if (typeLabel === "线下培训") {
				result = await W2Request.training();
			} else if (typeLabel === "申请加班") {
				result = await W2Request.applyOvertime();
			}
			const success = FormatValidation.validateMomo(momoText)
				&& FormatValidation.validateTime(timeText)
				&& result.code === 200;

			this.updateStatusUI({
				box: this.apply_activity_transfer_message_box,
				inputs: [], // 如果需要可以传输入框
				success,
				message: success
					? "已发送抽调请求"
					: "错误代码: " + result.code + " " + result.msg
			});

			this.apply_activity_transfer_time_text.value = "";
			this.apply_activity_transfer_momo_text.value = "";
		});

		// 抽调列表
		this.apply_activity_transfer_prev_page_btn.addEventListener("click", async () => {
			W2Global.setting.applyActivityTransferList.page--;
			await this.applyActivityTransferList();
		});
		this.apply_activity_transfer_next_page_btn.addEventListener("click", async () => {
			W2Global.setting.applyActivityTransferList.page++;
			await this.applyActivityTransferList();
		});
		this.apply_activity_transfer_refresh_page_btn.addEventListener("click", async () => {
			await this.applyActivityTransferList();
		});
	}
	validateField({
		inputDom,
		messageBox,
		validateFn,
		errorMessage
	}) {
		const iconDom = DomHelper.bySelectorFromParent(messageBox, "i");
		const textDom = DomHelper.bySelectorFromParent(messageBox, "span");

		const ok = validateFn(inputDom.value);

		if (!ok) {
			textDom.innerText = errorMessage;
			iconDom.classList.replace("fa-info-circle", "fa-exclamation-circle");

			messageBox.classList.remove("hidden");
			messageBox.classList.remove("bg-blue-50","text-blue-500","border-blue-200");
			messageBox.classList.add("bg-red-50","text-red-500","border-red-200");

			inputDom.classList.remove("border-gray-300","focus:ring-blue-500");
			inputDom.classList.add("border-red-500","focus:ring-red-500");

			return false;
		}

		messageBox.classList.add("hidden");
		messageBox.classList.remove("bg-red-50","text-red-500","border-red-200");
		messageBox.classList.add("bg-blue-50","text-blue-500","border-blue-200");

		inputDom.classList.remove("border-red-500","focus:ring-red-500");
		inputDom.classList.add("border-gray-300","focus:ring-blue-500");

		return true;
	}
	/**
	 * 通用 UI 更新方法
	 * @param {Object} options
	 * @param {HTMLElement} options.box - 提示框
	 * @param {HTMLElement[]} options.inputs - 输入框列表
	 * @param {Boolean} options.success - 是否成功
	 * @param {String} options.message - 提示文本
	 */
	updateStatusUI({ box, inputs = [], success, message }) {
		// 显示提示框
		box.classList.remove("hidden");

		// 清空两套提示框样式
		box.classList.remove("bg-blue-50","text-blue-500","border-blue-200");
		box.classList.remove("bg-red-50","text-red-500","border-red-200");

		// 设置提示框样式 & 图标
		const icon = box.querySelector("i");
		const text = box.querySelector("span");

		if (success) {
			box.classList.add("bg-blue-50","text-blue-500","border-blue-200");
			icon.classList.replace("fa-exclamation-circle", "fa-info-circle");
		} else {
			box.classList.add("bg-red-50","text-red-500","border-red-200");
			icon.classList.replace("fa-info-circle", "fa-exclamation-circle");
		}

		text.innerText = message;

		// 输入框成功失败样式
		inputs.forEach(input => {
			input.classList.remove("border-red-500","focus:ring-red-500");
			input.classList.remove("border-gray-300","focus:ring-blue-500");

			if (success) {
				input.classList.add("border-gray-300","focus:ring-blue-500");
			} else {
				input.classList.add("border-red-500","focus:ring-red-500");
			}
		});
	}
	async updateUIElement() {
		this.addTooltipMessage();
		let task = [
			{
				action: async () => {
					this.loginStatusTask();
					
				},
				intervalMs: 1000,
				name: W2Global.task.uiTask.login
			},
			{
				action: async () => {
					this.workingStatusTask();
				},
				intervalMs: 1000,
				name: W2Global.task.uiTask.working
			},
			{
				action: async () => {
					this.workHourStatusTask();
				},
				intervalMs: 1500,
				name: W2Global.task.uiTask.workHour
			},
			{
				action: async () => {
					this.currentTimeLineTask();
				},
				intervalMs: 1000,
				name: W2Global.task.uiTask.currentTimeLine
			},
			{
				action: async () => {
					this.personalStatusTask();
				},
				intervalMs: 1000 * 4,
				name: W2Global.task.uiTask.personal
			},
			{
				action: async () => {
					this.calendarTask();
				},
				intervalMs: 1000 * 5,
				name: W2Global.task.uiTask.calendar
			},
			{
				action: async () => {
					this.applyActivityTransferList();
				},
				intervalMs: 1000 * 5,
				name: W2Global.task.uiTask.applyActivityTransferList
			},
		]
		task.forEach(cofig => {
			TimerScheduler.setIntervalTask(
				cofig.action,
				cofig.intervalMs,
				cofig.name
			);
		});
	}
	// 获取工作信息
	static async getPersonalInformat() {
		let loginInformat = {
			loginStatus: null,
			workingStatus: null,
			workHourStatus: null
		};
		let getTokenResult = await W2Request.login();
		if (getTokenResult.code !== 200) {
			this.log.error("获取登录状态失败, 请检查是否登录");
			return false;
		}
		let getPersonalInformatResult = await W2Request.getPersonalInformat();
		if (getPersonalInformatResult.code !== 200) {
			this.log.error("获取工作状态失败, 请检查是否登录");
			return false;
		}
		loginInformat.loginStatus = W2Global.status.login;
		loginInformat.workingStatus = getPersonalInformatResult.data.working_status;
		loginInformat.workHourStatus = getPersonalInformatResult.data.work_hour_status;
		return loginInformat;
	}
	// 常驻的提示栏
	async addTooltipMessage() {
		this.tooltip.addTooltip(this.login_btn, "进行登录");
		this.tooltip.addTooltip(this.relogin_btn, "重新进行登录");
		this.tooltip.addTooltip(this.login_out_btn, "进行手动退出登录");
		this.tooltip.addTooltip(this.check_in_btn, "签到(按设置中的上班时间段签到)");
		this.tooltip.addTooltip(this.check_out_btn, "签出(按设置中的下班时间段签出)");
		this.tooltip.addTooltip(this.meal_working_status_btn, "切换状态(可能会延迟几秒)");
		this.tooltip.addTooltip(this.current_time_line_task_turn_on_off_i, "亮起代表任务正常运行");
		this.tooltip.addTooltip(this.current_time_line_task_start_btn, "启动任务");
		this.tooltip.addTooltip(this.current_time_line_task_stop_btn, "停止任务");
		// 排班列表
		this.tooltip.addTooltip(this.prev_month_btn, "查看上个月排班");
		this.tooltip.addTooltip(this.next_month_btn, "查看下个月排班");
		// 申请抽调
		this.tooltip.addTooltip(this.apply_activity_transfer_momo_text, "格式为中英文, 不允许有符号");
	}
	// 每三秒更新一次考勤状态和工作状态
	async personalStatusTask() {
		if (W2Global.status.login === W2Global.statusMap.loginStatus.login_success) {
			W2Global.cache.information.informat = await W2Request.getPersonalInformat();
		}
	}
	// 更新抽调列表
	async applyActivityTransferList() {
		const apply_activity_transfer_loading = this.apply_activity_transfer_loading;
		let result = await W2Request.getApplyApprovalList();
		if (W2Global.status.login === W2Global.statusMap.loginStatus.login_success && result.code === 200) {
			if (W2Global.setting.applyActivityTransferList.page <= 1) {
				this.apply_activity_transfer_prev_page_btn.disabled = true;
				DomHelper.bySelectorFromParent(this.apply_activity_transfer_prev_page_btn, "i").classList.add('opacity-50');
				DomHelper.bySelectorFromParent(this.apply_activity_transfer_prev_page_btn, "i").classList.add('text-gray-400');
			} else {
				this.apply_activity_transfer_prev_page_btn.disabled = false;
				DomHelper.bySelectorFromParent(this.apply_activity_transfer_prev_page_btn, "i").classList.remove('opacity-50');
				DomHelper.bySelectorFromParent(this.apply_activity_transfer_prev_page_btn, "i").classList.remove('text-gray-400');
			}
			if (W2Global.setting.applyActivityTransferList.page >= 3) {
				this.apply_activity_transfer_next_page_btn.disabled = true;
				DomHelper.bySelectorFromParent(this.apply_activity_transfer_next_page_btn, "i").classList.add('opacity-50');
				DomHelper.bySelectorFromParent(this.apply_activity_transfer_next_page_btn, "i").classList.add('text-gray-400');
			} else {
				this.apply_activity_transfer_next_page_btn.disabled = false;
				DomHelper.bySelectorFromParent(this.apply_activity_transfer_next_page_btn, "i").classList.remove('opacity-50');
				DomHelper.bySelectorFromParent(this.apply_activity_transfer_next_page_btn, "i").classList.remove('text-gray-400');
			}
			apply_activity_transfer_loading.classList.add("hidden");
			this.apply_activity_transfer_table.innerHTML = "";
			result.data.data_list.forEach(item => {
				const timeTemp = Time.formatTimeRange(item.detail.time);
				const type = item.detail.type;
				const time = timeTemp[1];
				const reason = item.detail.reason;
				const recordDiv = document.createElement('div');
				recordDiv.className = 'grid grid-cols-3 flex justify-between items-center bg-gray-50 hover:bg-blue-50 transition shadow-sm rounded-xl px-4 py-3 border border-gray-100';

				const typeDiv = document.createElement('div');
				typeDiv.className = 'flex flex-col';
				const typeLabel = document.createElement('span');
				typeLabel.className = 'text-gray-500 text-xs';
				typeLabel.textContent = '类型';
				const typeValue = document.createElement('span');
				typeValue.className = 'text-base font-semibold text-gray-800';
				typeValue.textContent = type;
				typeDiv.appendChild(typeLabel);
				typeDiv.appendChild(typeValue);

				const timeDiv = document.createElement('div');
				timeDiv.className = 'flex flex-col';
				const timeLabel = document.createElement('span');
				timeLabel.className = 'text-gray-500 text-xs';
				timeLabel.textContent = '时间 (' + timeTemp[0] + ")";
				const timeValue = document.createElement('span');
				timeValue.className = 'text-base font-semibold text-gray-800';
				timeValue.textContent = time;
				timeDiv.appendChild(timeLabel);
				timeDiv.appendChild(timeValue);

				const reasonDiv = document.createElement('div');
				reasonDiv.className = 'flex flex-col';
				const reasonLabel = document.createElement('span');
				reasonLabel.className = 'text-gray-500 text-xs';
				reasonLabel.textContent = '抽调原因';
				const reasonValue = document.createElement('span');
				reasonValue.className = 'text-base font-semibold text-gray-800';
				reasonValue.textContent = reason;
				reasonDiv.appendChild(reasonLabel);
				reasonDiv.appendChild(reasonValue);

				recordDiv.appendChild(typeDiv);
				recordDiv.appendChild(timeDiv);
				recordDiv.appendChild(reasonDiv);

				this.apply_activity_transfer_table.appendChild(recordDiv);
				
			});
		} else {
			this.apply_activity_transfer_table.innerHTML = "";
		}
	}
	// 登录选项卡的状态显示
	async loginStatusTask() {
		this.login_status_label.innerText = W2Global.status.login || "--";
	}
	// 考勤打卡选项卡的状态显示
	async workingStatusTask() {
		if (W2Global.status.login === W2Global.statusMap.loginStatus.login_success){
			if (W2Global.cache.information.informat === null) {
				
			} else if (W2Global.cache.information.informat.code === 200) {
				// 使用的是 workingStatus 中的键值
				this.check_in_out_label.innerText = W2Global.statusMap.workingStatus[W2Global.cache.information.informat.data.working_status] || W2.status.unknown;
			} else {
				this.check_in_out_label.innerText = W2Global.statusMap.unknown;
			}
		} else {
			this.check_in_out_label.innerText = W2Global.statusMap.unknown;
		}
	}
	async workHourStatusTask() {
		if (W2Global.status.login === W2Global.statusMap.loginStatus.login_success) {
			if (W2Global.cache.information.informat === null) {

			} else if (W2Global.cache.information.informat.code === 200) {
				this.meal_working_status_label.innerText = W2Global.statusMap.workHourStatus[W2Global.cache.information.informat.data.work_hour_status] || W2.status.unknown;
			} else {
				this.meal_working_status_label.innerText = W2Global.statusMap.unknown;
			}
		} else {
			this.meal_working_status_label.innerText = W2Global.statusMap.unknown;
		}
	}
	// 时间线任务
	async currentTimeLineTask() {
		if (W2Global.status.login === W2Global.statusMap.loginStatus.login_success) {
			if (TimerScheduler.hasTask(W2Global.task.dailyTask.login)) {
				this.current_time_line_task_turn_on_off_i.classList.replace("fa-regular", "fa-solid");
			} else {
				this.current_time_line_task_turn_on_off_i.classList.replace("fa-solid", "fa-regular");
			}
			for (let i = 0; i < 4; i++) {
				const icon = this["current_time_line_task_icon_" + i];
				const label = this["current_time_line_task_label_" + i];
				// currentTask的值是currentTaskStatus枚举体中的键值, 由间隔任务currentTask()变更
				
				if (label.innerText === W2Global.status.current_time_line) {
					icon.classList.replace("text-blue-600", "text-green-600");
				} else {
					icon.classList.replace("text-green-600", "text-blue-600");
				}
			}
		} else {
			// 如果未登录, 则将图标全部置为蓝色
			this.current_time_line_task_turn_on_off_i.classList.replace("fa-solid", "fa-regular");
			for (let i = 0; i < 4; i++) {
				const icon = this["current_time_line_task_icon_" + i];
				icon.classList.replace("text-green-600", "text-blue-600");
			}
		}
	}
	async addAanimationEffect() {
		// 申请抽调下拉列表的动画
		const selectBox = this.apply_activity_transfer_type_div;
		const optionsBox = this.apply_activity_transfer_type_ul;
		const label = this.apply_activity_transfer_type_label;
		let open = false;

		function animateDropdown(expand) {
			const duration = 200;
			const startHeight = expand ? 0 : optionsBox.scrollHeight;
			const endHeight = expand ? optionsBox.scrollHeight : 0;
			const startOpacity = expand ? 0 : 1;
			const endOpacity = expand ? 1 : 0;
			const startTime = performance.now();

			function step(timestamp) {
				const progress = Math.min((timestamp - startTime) / duration, 1);
				optionsBox.style.maxHeight = (startHeight + (endHeight - startHeight) * progress) + 'px';
				optionsBox.style.opacity = startOpacity + (endOpacity - startOpacity) * progress;
				if (progress < 1) requestAnimationFrame(step);
			}
			requestAnimationFrame(step);
		}

		// 点击下拉框本身切换
		selectBox.addEventListener('click', (e) => {
			e.stopPropagation(); // 阻止冒泡
			open = !open;
			animateDropdown(open);
		});

		// 选择选项
		optionsBox.querySelectorAll('li').forEach(item => {
			item.addEventListener('click', (e) => {
				e.stopPropagation(); // 阻止冒泡
				label.textContent = item.textContent;
				open = false;
				animateDropdown(false);
			});
		});

		// 点击页面其他地方收起
		document.addEventListener('click', () => {
			if (open) {
				open = false;
				animateDropdown(false);
			}
		});

		// 按钮点击效果
		DomHelper.allBySelector('button').forEach(btn => {
			btn.addEventListener('click', () => {
				// 添加点击效果样式
				btn.classList.add('ring-2', 'ring-offset-1', 'ring-indigo-300'); // 可以调整颜色
				// 0.2秒后移除效果
				setTimeout(() => {
					btn.classList.remove('ring-2', 'ring-offset-1', 'ring-indigo-300');
				}, 200);
			});
		});
	}
	// 判断今天是否是休息日
	static async isTodayOff() {
		// 保存当前月份，避免副作用
		const prevMonth = W2Global.setting.calendar.month;
		W2Global.setting.calendar.month = Time.getCurrentMonth();

		// 获取当前月份的排班数据
		const scheduleResult = await W2Request.queryPersonalSchedule();

		// 恢复原月份
		W2Global.setting.calendar.month = prevMonth;

		// 基础数据校验
		if (!scheduleResult || !scheduleResult.data || 
			!Array.isArray(scheduleResult.data.detail_data_list) || 
			scheduleResult.data.detail_data_list.length === 0) {
			return true; // 若无法获取数据，视为休息
		}

		const detailData = scheduleResult.data.detail_data_list[0];
		const scheduleInfos = detailData.schedule_infos || {};

		// 获取今天日期字符串（格式：YYYY-MM-DD）
		const today = Time.getCurrentDate("default");

		// 若没有今日排班信息，视为休息日
		if (!scheduleInfos[today]) {
			return true;
		}

		const todaySchedule = scheduleInfos[today];
		const scheduleName = todaySchedule.schedule_conf_name || "";

		// 判断是否为休息日
		const isOff = scheduleName.includes("休息");

		this.log.log(`今日排班: ${scheduleName}, 是否休息: ${isOff}`);

		return isOff;
	}

	// 我的排班日历
	async calendarTask() {
		const calendar_loading = this.calendar_loading;
		let result = await W2Request.queryPersonalSchedule();
		if (W2Global.status.login ===W2Global.statusMap.loginStatus.login_success && result.code === 200) {
			// 日历标题
			calendar_label.innerText = Time.getCurrentYear() + " 年 " + W2Global.setting.calendar.month + " 月";

			// 下个月按钮
			if (W2Global.setting.calendar.month >= Time.getCurrentMonth()) {
				this.next_month_btn.classList.add('opacity-50', 'pointer-events-none', 'text-gray-400');
				DomHelper.bySelectorFromParent(this.next_month_btn, "i").classList.add('text-gray-400');
			} else {
				this.next_month_btn.classList.remove('opacity-50', 'pointer-events-none', 'bg-gray-200', 'text-gray-400');
				DomHelper.bySelectorFromParent(this.next_month_btn, "i").classList.remove('text-gray-400', 'pointer-events-none');
			}

			// 上个月按钮
			if (W2Global.setting.calendar.month <= 1) {
				this.prev_month_btn.classList.add('opacity-50', 'pointer-events-none', 'text-gray-400');
				DomHelper.bySelectorFromParent(this.prev_month_btn, "i").classList.add('text-gray-400');
			} else {
				this.prev_month_btn.classList.remove('opacity-50', 'pointer-events-none', 'bg-gray-200', 'text-gray-400');
				DomHelper.bySelectorFromParent(this.prev_month_btn, "i").classList.remove('text-gray-400', 'pointer-events-none');
			}

			// 隐藏进度条
			calendar_loading.classList.add("hidden");

			// 日历容器清空
			this.calendar_title.innerHTML = "";
			this.calendar_table.innerHTML = "";

			// 星期标题
			const weekNames = ["日", "一", "二", "三", "四", "五", "六"];
			for (let i = 0; i < weekNames.length; i++) {
				const w = DomHelper.createDom("div");
				w.classList.add(
					"py-2",
					"text-center",
					"font-medium",
					"text-gray-600"
				);
				w.textContent = weekNames[i];
				calendar_title.appendChild(w);
			}

			this.calendar_table.parentNode.insertBefore(calendar_title, this.calendar_table);

			// 日历日期计算
			let firstWeekDay = Time.getFirstDayOfMonthWeek(result.data.column[0].date);
			let lastDate = parseInt(result.data.column[result.data.column.length - 1].date.split("-")[2]);
			let offsetToSaturday = firstWeekDay % 7;

			// 填充空占位
			for (let i = 0; i < offsetToSaturday; i++) {
				const emptyDiv = DomHelper.createDom("div");
				emptyDiv.classList.add("py-2", "rounded");
				this.calendar_table.appendChild(emptyDiv);
			}

			// 获取排班数据
			const scheduleInfos = result.data.detail_data_list?.[0]?.schedule_infos || {};

			// 生成每一天日期
			for (let d = 1; d <= lastDate; d++) {
				const dateDiv = DomHelper.createDom('div');
				const current = new Date(Time.getCurrentYear(), W2Global.setting.calendar.month - 1, d);
				dateDiv.id = `calendar_date_${d}`;
				dateDiv.textContent = d;

				// 基础样式
				dateDiv.classList.add(
					"py-2",
					"rounded",
					"cursor-pointer",
					"transition-colors",
					"duration-200",
					"text-center"
				);

				const formattedDate = Time.formatDate(Time.getCurrentYear(), W2Global.setting.calendar.month, d);
				const daySchedule = scheduleInfos[formattedDate];

				// 状态判断并添加样式
				if (Time.isToday(current) && (!daySchedule || daySchedule.schedule_conf_name === "休息")) {
					// 今天休息日 → 深绿色
					dateDiv.classList.add("bg-green-500", "text-white", "font-semibold", "shadow-sm");
					this.tooltip.addTooltip(dateDiv, "今天休息");
				} else if (!daySchedule || daySchedule.schedule_conf_name === "休息") {
					// 其他休息日 → 浅绿色
					dateDiv.classList.add("bg-green-200", "text-green-700", "font-semibold", "shadow-sm");
					this.tooltip.addTooltip(dateDiv, "休息日");
				} else if (Time.isToday(current)) {
					// 今天工作日 → 蓝色
					dateDiv.classList.add("bg-blue-300", "text-white", "font-semibold", "shadow-sm");
					this.tooltip.addTooltip(dateDiv, "今天");
				} else {
					// 普通工作日 → 灰色
					dateDiv.classList.add("bg-gray-50", "hover:bg-blue-100");
				}

				this.calendar_table.appendChild(dateDiv);
			}
		} else {
			calendar_label.innerText = W2.status.unknown;
			calendar_table.innerHTML = "";
		}
	}

	// 间隔任务
	static async intervalTask() {
		const task = [
			{
				action: async () => { 
					await W2Web.loginCheck() 
				},
				intervalMs: 60 * 1000,
				name: W2Global.task.intervalTask.loginCheck
			}
		]
		task.forEach(config => {
			TimerScheduler.setIntervalTask(
				config.action,
				config.intervalMs,
				config.name
			);
		});
		this.log.log("W2间隔任务已启动");
	}
	// 定时任务
	static async currentTask() {
		const task = [
			{
				start: W2Global.setting.time_range_login_start,
				end:  W2Global.setting.time_range_login_end,
				action: async () => { 
					await W2.login();
					// Message.notify({ content: "W2登录成功" });
				},
				name: W2Global.task.dailyTask.login
			},
			{
				start:  W2Global.setting.time_range_check_in_start,
				end:  W2Global.setting.time_range_check_in_end,
				action: async () => { 
					await W2Request.checkIn();
					Message.notify({ body: " W2 签到成功" });
					W2Global.status.current_time_line = W2Global.statusMap.currentTaskStatus.workIn;
				},
				name: W2Global.task.dailyTask.chinekIn
			},
			{
				start:  W2Global.setting.time_range_meal_start,
				end:  W2Global.setting.time_range_meal_end,
				action: async () => { 
					await W2Request.meal();
					Message.notify({ body: "W2 前往用餐 切换成功" });
					W2Global.status.current_time_line = W2Global.statusMap.currentTaskStatus.meal;
				},
				name: W2Global.task.dailyTask.meal
			},
			{
				start:  W2Global.setting.time_range_working_start,
				end:  W2Global.setting.time_range_working_end,
				action: async () => { 
					await W2Request.working();
					Message.notify({ body: "W2 前往标注 切换成功" });
					W2Global.status.current_time_line = W2Global.statusMap.currentTaskStatus.working;
				},
				name: W2Global.task.dailyTask.working
			},
			{
				start:  W2Global.setting.time_range_check_out_start,
				end:  W2Global.setting.time_range_check_out_end,
				action: async () => { 
					await W2Request.checkOut();
					Message.notify({ body: "W2 签退成功" });
					W2Global.status.current_time_line = W2Global.statusMap.currentTaskStatus.workOut;
				},
				name: W2Global.task.dailyTask.checkOut
			},
			{
				start:  W2Global.setting.time_range_login_out_start,
				end:  W2Global.setting.time_range_login_out_end,
				action: async () => { 
					await W2Request.loginOut(); 
				},
				name: W2Global.task.dailyTask.loginOut
			}
		];

		// if (await W2.isLoginStatus()) {
			// if (!await W2.isTodayOff()) {
					for (const config of task) {
						TimerScheduler.setDailyTask(
							Time.getRandomTimeInRange(config.start, config.end),
							config.action,
							config.name
						);
					}
				this.log.log("今天是工作日, 定时任务已启动");
			// } else {
			// 	this.log.log("今天是休息日");
			// }
		// } else {
		// 	this.log.log("未登录");
		// }
	}
	// 停止所有W2时间线任务
	static async stopAllTask() {
		Object.values(W2Global.task.dailyTask).forEach(taskName => {
			TimerScheduler.stopTask(taskName);
		});
	}
}
