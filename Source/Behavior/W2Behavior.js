class W2Behavior extends Behavior {
	static __autoRegister = Behavior._register(this);
}
class W2BehaviorBindEvents extends W2Behavior {
	static async loginClick() {
		this.login_btn.addEventListener("click", async () => {
			await W2BehaviorTask.loginProcess();
			await LSBehaviorTask.currentTask();
		});
	}

	static async reloginClick() {
		this.relogin_btn.addEventListener("click", async () => {
			// 再写一个 relogin 函数
		});
	}

	static async loginOutClick() {
		this.login_out_btn.addEventListener("click", async () => {
			await W2Request.loginOut();
			this.check_in_out_label.innerText = W2Global.statusMap.unknown;
			this.meal_working_status_label.innerText = W2Global.statusMap.unknown;
			this.calendar_label.innerText = W2Global.statusMap.unknown;
			this.apply_activity_transfer_table.innerHTML = "";
			this.calendar_table.innerHTML = "";
			W2Global.status.login = W2Global.statusMap.loginStatus.not_login;
			W2BehaviorTask.stopAllTask();
			W2BehaviorUpdateUIElement.stopAllUiTask();
		});
	}

	static async mealWorkingStatusClick() {
		this.meal_working_status_btn.addEventListener("click", async () => {
			if (this.meal_working_status_label.innerText === "正在标注") {
				if (await W2Request.meal()) {
					Message.notify({ body: "切换前往用餐成功" });
					this.log.log("切换前往用餐成功");
				} else {
					Message.notify({ body: "切换前往用餐失败" });
					this.log.log("切换前往用餐失败");
				}
			} else if (this.meal_working_status_label.innerText === "前往用餐") {
				if (await W2Request.working()) {
					Message.notify({ body: "切换正在标注成功" });
					this.log.log("切换正在标注成功");
				} else {
					Message.notify({ body: "切换正在标注失败" });
					this.log.log("切换正在标注失败");
				}
			}
		});
	}

	static async checkInOutClick() {
		this.check_in_btn.addEventListener("click", async () => {
			if (await W2Request.checkIn()) {
				Message.notify({ body: "签到成功" });
				this.log.log("签到成功");
			} else {
				Message.notify({ body: "签到失败" });
				this.log.log("签到失败");
			}
		});
		this.check_out_btn.addEventListener("click", async () => {
			if (await W2Request.checkOut()) {
				Message.notify({ body: "签退成功" });
				this.log.log("签退成功");
			} else {
					Message.notify({ body: "签退失败" });
				this.log.log("签退失败");
			}
		});
	}

	static async currentTaskClick() {
		this.current_time_line_task_start_btn.addEventListener("click", async () => {
			await W2BehaviorTask.currentTask();
			Message.notify({ body: "已经开启W2所有任务" });
			this.log.log("已经开启W2所有任务");
		});
		this.current_time_line_task_stop_btn.addEventListener("click", async () => {
			await W2BehaviorTask.stopAllTask();
			Message.notify({ body: "已经关闭W2所有任务" });
			this.log.log("已经关闭W2所有任务");
		});
	}

	static async calendarNavClick() {
		this.prev_month_btn.addEventListener("click", async () => {
			W2Global.setting.calendar.month--;
			await W2BehaviorUpdateUIElement.calendarTask();
		});
		this.next_month_btn.addEventListener("click", async () => {
			W2Global.setting.calendar.month++;
			await W2BehaviorUpdateUIElement.calendarTask();
		});
	}

	static async applyActivityTransferClick() {
		this.apply_activity_transfer_btn.addEventListener("click", async () => {
			let typeLabel = this.apply_activity_transfer_type_label.innerText;
			let timeText = this.apply_activity_transfer_time_text.value;
			let momoText = this.apply_activity_transfer_momo_text.value;

			const okTime = W2BehaviorHelperUtils.validateField({
				inputDom: this.apply_activity_transfer_time_text,
				messageBox: this.apply_activity_transfer_message_box,
				validateFn: FormatValidation.validateTime,
				errorMessage: "时间格式错误, 请重新输入"
			});
			if (!okTime) return;

			const okMomo = W2BehaviorHelperUtils.validateField({
				inputDom: this.apply_activity_transfer_momo_text,
				messageBox: this.apply_activity_transfer_message_box,
				validateFn: FormatValidation.validateMomo,
				errorMessage: "备注格式错误, 请重新输入"
			});
			if (!okMomo) return;

			W2Global.cache.applyActivityTransfer.time = timeText;
			W2Global.cache.applyActivityTransfer.momo = momoText;

			// 映射对象，将 typeLabel 映射到对应的函数和消息
			const actionMap = {
				"抽调质检": W2Request.qualityInspection,
				"线下培训": W2Request.training,
				"申请加班": W2Request.applyOvertime,
			};

			// 根据 typeLabel 获取对应的函数和消息
			const action = actionMap[typeLabel];

			if (action) {
				const success = await action();
				const message = success ? "已发送抽调请求" : "抽调失败";

				// 更新 UI
				W2BehaviorHelperUtils.updateStatusUI({
					box: this.apply_activity_transfer_message_box,
					inputs: [],
					success,
					message
				});
			}

			this.apply_activity_transfer_time_text.value = "";
			this.apply_activity_transfer_momo_text.value = "";

			await W2BehaviorUpdateUIElement.applyActivityTransferList();
			// 等待五秒后隐藏提示框
			await Delay.sleepSeconds(5);
			this.apply_activity_transfer_message_box.classList.add("hidden");
		});
	}

	static async applyActivityTransferPageClick() {
		this.apply_activity_transfer_prev_page_btn.addEventListener("click", async () => {
			W2Global.setting.applyActivityTransferList.page--;
			await W2BehaviorUpdateUIElement.applyActivityTransferList();
		});
		this.apply_activity_transfer_next_page_btn.addEventListener("click", async () => {
			W2Global.setting.applyActivityTransferList.page++;
			await W2BehaviorUpdateUIElement.applyActivityTransferList();
		});
		this.apply_activity_transfer_refresh_page_btn.addEventListener("click", async () => {
			await W2BehaviorUpdateUIElement.applyActivityTransferList();
		});
	}
}
class W2BehaviorTask extends W2Behavior {
	// 登录流程
	static async loginProcess() {
		if (await W2Request.loginCheck()) {
			this.log.log("W2已登录, 无需重复登录");
			return;
		}
		this.log.log("正在进行登录W2操作...");
		W2Global.status.login = W2Global.statusMap.loginStatus.logining;
		if (await W2Request.getVerifyCode() === false) {
			this.log.error("登录失败");
			return;
		}
		this.log.log("验证码已发送, 等待接收");
		// await System.sleepSeconds(5);
		if (await W2Request.getMailList() === false) {
			this.log.error("登录失败");
			return;
		}
		this.log.log("正在登录");
		if (await W2Request.login() === false) {
			this.log.error("登录失败");
			return;
		}
		this.log.log("获取心跳");
		if (await W2Request.loginCheck() === false) {
			this.log.error("登录失败");
			return;
		}
		this.log.log("心跳正常, 登录成功");
	}
	// 间隔任务
	static async intervalTask() {
		const task = [
			{
				action: async () => {
					// 心跳任务
					await W2Request.loginCheck();
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
				start: W2Global.setting.time_range_login_process_start,
				end:  W2Global.setting.time_range_login_process_end,
				action: async () => {
					if (await W2Request.login()) {
						Message.notify({ body: "W2登录成功" });
						this.log.log("W2登录成功");
					} else {
						Message.notify({ body: "W2登录失败" });
						this.log.log("W2登录失败");
					}
				},
				name: W2Global.task.dailyTask.login
			},
			{
				start:  W2Global.setting.time_range_check_in_start,
				end:  W2Global.setting.time_range_check_in_end,
				action: async () => { 
					if(await W2Request.checkIn() === true) {
						Message.notify({ body: " W2 签到成功" });
						this.log.log("W2签到成功");
						W2Global.status.current_time_line = W2Global.statusMap.currentTaskStatus.workIn;
					} else {
						Message.notify({ body: " W2 签到失败" });
						this.log.log("W2签到失败");
					}
				},
				name: W2Global.task.dailyTask.chinekIn
			},
			{
				start:  W2Global.setting.time_range_meal_start,
				end:  W2Global.setting.time_range_meal_end,
				action: async () => { 
					if(await W2Request.meal()){
						Message.notify({ body: "W2 前往用餐 切换成功" });
						this.log.log("W2前往用餐 切换成功");
						W2Global.status.current_time_line = W2Global.statusMap.currentTaskStatus.meal;
					} else {
						Message.notify({ body: "W2 前往用餐 切换失败" });
						this.log.log("W2前往用餐 切换失败");
					}
				},
				name: W2Global.task.dailyTask.meal
			},
			{
				start:  W2Global.setting.time_range_working_start,
				end:  W2Global.setting.time_range_working_end,
				action: async () => { 
					if (await W2Request.working()) {
						Message.notify({ body: "W2 前往标注 切换成功" });
						W2Global.status.current_time_line = W2Global.statusMap.currentTaskStatus.working;
						this.log.log("W2前往标注 切换成功");
					} else {
						Message.notify({ body: "W2 前往标注 切换失败" });
						this.log.log("W2前往标注 切换失败");
					}
				},
				name: W2Global.task.dailyTask.working
			},
			{
				start:  W2Global.setting.time_range_check_out_start,
				end:  W2Global.setting.time_range_check_out_end,
				action: async () => {
					if (await W2Request.checkOut()) {
						Message.notify({ body: "W2 签退成功" });
						W2Global.status.current_time_line = W2Global.statusMap.currentTaskStatus.workOut;
						this.log.log("W2签退成功");
					} else {
						Message.notify({ body: "W2 签退失败" });
						this.log.log("W2签退失败");
					}
				},
				name: W2Global.task.dailyTask.checkOut
			},
			{
				start:  W2Global.setting.time_range_log_out_start,
				end:  W2Global.setting.time_range_log_out_end,
				action: async () => {
					if(await W2Request.loginOut()) {
						Message.notify({ body: "W2 退出登录"});
						this.log.log("W2退出登录");
					} else {
						Message.notify({ body: "W2 退出登录失败" });
						this.log.log("W2退出登录失败");
					}
				},
				name: W2Global.task.dailyTask.logOut
			}
		];
		// 添加一个能识别是否是工作日的逻辑, 如果是工作日就执行定时任务, 否则就不执行
		for (const config of task) {
			TimerScheduler.setDailyTask(
				Time.getRandomTimeInRange(config.start, config.end),
				config.action,
				config.name
			);
		}
		this.log.log("定时任务已启动");
	}
	// 停止所有W2时间线任务
	static async stopAllTask() {
		Object.values(W2Global.task.dailyTask).forEach(taskName => {
			TimerScheduler.stopTask(taskName);
		});
	}
}
class W2AddAanimationEffect extends W2Behavior {
	static initApplyActivityTransferDropdown() {
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
			e.stopPropagation();
			open = !open;
			animateDropdown(open);
		});

		// 选择选项
		optionsBox.querySelectorAll('li').forEach(item => {
			item.addEventListener('click', (e) => {
				e.stopPropagation();
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
				btn.classList.add('ring-2', 'ring-offset-1', 'ring-indigo-300');
				setTimeout(() => {
					btn.classList.remove('ring-2', 'ring-offset-1', 'ring-indigo-300');
				}, 200);
			});
		});
	}
}
class W2BehaviorHelperUtils extends W2Behavior {
	// 常驻的提示栏
	static async addTooltipMessage() {
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
	static validateField({
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
	static updateStatusUI({ box, inputs = [], success, message }) {
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
}
class W2BehaviorUpdateUIElement extends W2Behavior {
	// 登录选项卡的状态显示
	static async loginStatusTask() {
		this.login_status_label.innerText = W2Global.status.login || "--";
	}
	static async getPersonalInformat() {
		await W2Request.getPersonalInformat();
	}
	// 考勤打卡选项卡的状态显示
	static async workingStatusTask() {
		if (W2Global.status.login === W2Global.statusMap.loginStatus.login_success){
			if (W2Global.cache.information.informat === null) {
				
			} else if (W2Global.cache.information.informat.code === 200) {
				// 使用的是 workingStatus 中的键值
				this.check_in_out_label.innerText = W2Global.statusMap.workingStatus[W2Global.cache.information.informat.data.working_status] || W2Global.statusMap.unknown;
			} else {
				this.check_in_out_label.innerText = W2Global.statusMap.unknown;
			}
		} else {
			this.check_in_out_label.innerText = W2Global.statusMap.unknown;
		}
	}
	static async workHourStatusTask() {
		if (W2Global.status.login === W2Global.statusMap.loginStatus.login_success) {
			if (W2Global.cache.information.informat === null) {

			} else if (W2Global.cache.information.informat.code === 200) {
				this.meal_working_status_label.innerText = W2Global.statusMap.workHourStatus[W2Global.cache.information.informat.data.work_hour_status] || W2Global.statusMap.unknown;
			} else {
				this.meal_working_status_label.innerText = W2Global.statusMap.unknown;
			}
		} else {
			this.meal_working_status_label.innerText = W2Global.statusMap.unknown;
		}
	}
	// 时间线任务
	static async currentTimeLineTask() {
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
	// 每三秒更新一次考勤状态和工作状态
	static async getPersonalInformat() {
		if (W2Global.status.login === W2Global.statusMap.loginStatus.login_success) {
			await W2Request.getPersonalInformat();
		}
	}
	// 我的排班日历
	static async calendarTask() {
		const calendar_loading = this.calendar_loading;

		// 显示加载状态
		calendar_loading.classList.remove("hidden");

		const calendarData = await W2Request.queryPersonalSchedule();

		// 登录失败或无数据
		if (
			W2Global.status.login !== W2Global.statusMap.loginStatus.login_success ||
			!calendarData
		) {
			calendar_label.innerText = W2Global.statusMap.unknown;
			this.calendar_title.innerHTML = "";
			this.calendar_table.innerHTML = "";
			calendar_loading.classList.add("hidden");
			return;
		}

		const { column, scheduleInfos } = calendarData;

		// 日历标题
		calendar_label.innerText =
			Time.getCurrentYear() + " 年 " + W2Global.setting.calendar.month + " 月";

		// 下个月按钮状态
		if (W2Global.setting.calendar.month >= Time.getCurrentMonth()) {
			this.next_month_btn.classList.add("opacity-50", "pointer-events-none", "text-gray-400");
			DomHelper.bySelectorFromParent(this.next_month_btn, "i").classList.add("text-gray-400");
		} else {
			this.next_month_btn.classList.remove("opacity-50", "pointer-events-none", "bg-gray-200", "text-gray-400");
			DomHelper.bySelectorFromParent(this.next_month_btn, "i").classList.remove("text-gray-400", "pointer-events-none");
		}

		// 上个月按钮状态
		if (W2Global.setting.calendar.month <= 1) {
			this.prev_month_btn.classList.add("opacity-50", "pointer-events-none", "text-gray-400");
			DomHelper.bySelectorFromParent(this.prev_month_btn, "i").classList.add("text-gray-400");
		} else {
			this.prev_month_btn.classList.remove("opacity-50", "pointer-events-none", "bg-gray-200", "text-gray-400");
			DomHelper.bySelectorFromParent(this.prev_month_btn, "i").classList.remove("text-gray-400", "pointer-events-none");
		}

		// 隐藏加载状态
		calendar_loading.classList.add("hidden");

		// 清空日历
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
			this.calendar_title.appendChild(w);
		}

		this.calendar_table.parentNode.insertBefore(
			this.calendar_title,
			this.calendar_table
		);

		// 计算日期信息
		const firstWeekDay = Time.getFirstDayOfMonthWeek(column[0].date);
		const lastDate = parseInt(
			column[column.length - 1].date.split("-")[2]
		);
		const offset = firstWeekDay % 7;

		// 填充前置空位
		for (let i = 0; i < offset; i++) {
			const emptyDiv = DomHelper.createDom("div");
			emptyDiv.classList.add("py-2", "rounded");
			this.calendar_table.appendChild(emptyDiv);
		}

		// 生成每日日期
		for (let d = 1; d <= lastDate; d++) {
			const dateDiv = DomHelper.createDom("div");
			const currentDate = new Date(
				Time.getCurrentYear(),
				W2Global.setting.calendar.month - 1,
				d
			);

			dateDiv.id = `calendar_date_${d}`;
			dateDiv.textContent = d;

			dateDiv.classList.add(
				"py-2",
				"rounded",
				"text-center",
				"cursor-pointer",
				"transition-colors",
				"duration-200"
			);

			const formattedDate = Time.formatDate(
				Time.getCurrentYear(),
				W2Global.setting.calendar.month,
				d
			);

			const daySchedule = scheduleInfos[formattedDate];

			// 样式与提示
			if (Time.isToday(currentDate) && (!daySchedule || daySchedule.schedule_conf_name === "休息")) {
				dateDiv.classList.add("bg-green-500", "text-white", "font-semibold", "shadow-sm");
				this.tooltip.addTooltip(dateDiv, "今天休息");
			} else if (!daySchedule || daySchedule.schedule_conf_name === "休息") {
				dateDiv.classList.add("bg-green-200", "text-green-700", "font-semibold", "shadow-sm");
				this.tooltip.addTooltip(dateDiv, "休息日");
			} else if (Time.isToday(currentDate)) {
				dateDiv.classList.add("bg-blue-300", "text-white", "font-semibold", "shadow-sm");
				this.tooltip.addTooltip(dateDiv, "今天");
			} else {
				dateDiv.classList.add("bg-gray-50", "hover:bg-blue-100");
			}

			this.calendar_table.appendChild(dateDiv);
		}
	}

	// 更新抽调列表
	static async applyActivityTransferList() {
		const loading = this.apply_activity_transfer_loading;

		loading.classList.remove("hidden");

		const data = await W2Request.getApplyApprovalList();

		// 登录失败或无数据
		if (
			W2Global.status.login !== W2Global.statusMap.loginStatus.login_success ||
			!data
		) {
			this.apply_activity_transfer_table.innerHTML = "";
			loading.classList.add("hidden");
			return;
		}

		const { list, page } = data;

		// 上一页按钮
		if (page <= 1) {
			this.apply_activity_transfer_prev_page_btn.disabled = true;
			DomHelper
				.bySelectorFromParent(this.apply_activity_transfer_prev_page_btn, "i")
				.classList.add("opacity-50", "text-gray-400");
		} else {
			this.apply_activity_transfer_prev_page_btn.disabled = false;
			DomHelper
				.bySelectorFromParent(this.apply_activity_transfer_prev_page_btn, "i")
				.classList.remove("opacity-50", "text-gray-400");
		}

		// 下一页按钮
		if (page >= 3) {
			this.apply_activity_transfer_next_page_btn.disabled = true;
			DomHelper
				.bySelectorFromParent(this.apply_activity_transfer_next_page_btn, "i")
				.classList.add("opacity-50", "text-gray-400");
		} else {
			this.apply_activity_transfer_next_page_btn.disabled = false;
			DomHelper
				.bySelectorFromParent(this.apply_activity_transfer_next_page_btn, "i")
				.classList.remove("opacity-50", "text-gray-400");
		}

		// 清空列表
		this.apply_activity_transfer_table.innerHTML = "";

		// 渲染列表
		list.forEach(item => {
			const timeTemp = Time.formatTimeRange(item.detail.time);
			const type = item.detail.type;
			const time = timeTemp[1];
			const reason = item.detail.reason;

			const recordDiv = document.createElement("div");
			recordDiv.className =
				"grid grid-cols-3 items-center bg-gray-50 hover:bg-blue-50 transition shadow-sm rounded-xl px-4 py-3 border border-gray-100";

			// 类型
			const typeDiv = document.createElement("div");
			typeDiv.className = "flex flex-col";
			typeDiv.innerHTML = `
				<span class="text-gray-500 text-xs">类型</span>
				<span class="text-base font-semibold text-gray-800">${type}</span>
			`;

			// 时间
			const timeDiv = document.createElement("div");
			timeDiv.className = "flex flex-col";
			timeDiv.innerHTML = `
				<span class="text-gray-500 text-xs">时间 (${timeTemp[0]})</span>
				<span class="text-base font-semibold text-gray-800">${time}</span>
			`;

			// 原因
			const reasonDiv = document.createElement("div");
			reasonDiv.className = "flex flex-col";
			reasonDiv.innerHTML = `
				<span class="text-gray-500 text-xs">抽调原因</span>
				<span class="text-base font-semibold text-gray-800">${reason}</span>
			`;

			recordDiv.appendChild(typeDiv);
			recordDiv.appendChild(timeDiv);
			recordDiv.appendChild(reasonDiv);

			this.apply_activity_transfer_table.appendChild(recordDiv);
		});

		loading.classList.add("hidden");
	}
	static async stopAllUiTask() {
		Object.values(W2Global.task.uiTask).forEach(taskName => {
			TimerScheduler.stopTask(taskName);
		});
	}
}