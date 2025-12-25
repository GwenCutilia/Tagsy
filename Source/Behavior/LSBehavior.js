class LSBehavior extends Behavior {
	static __autoRegister = Behavior._register(this);
}
class LSBehaviorBindEvents extends LSBehavior {
	static initLSDomButtons() {
		this.login_btn.addEventListener("click", async () => {
			await LSBehaviorTask.loginProcess();
		});

		this.login_out_btn.addEventListener("click", async () => {
			await LSBehaviorTask.loginOut();
			LSGlobal.status.login = LSGlobal.statusMap.loginStatus.out;
		});

		this.fill_daily_report_btn.addEventListener("click", async () => {
			await LSRequest.fillDailyReport();
		});
	}
}
class LSBehaviorTask extends LSBehavior {
	// 登录
	static async loginProcess() {
		if (await LSRequest.login()) {
			this.log.log("LS登录成功");
		} else {
			let count = 0;
			while (count < 3) {
				if (await LSRequest.login()) {
					this.log.log("LS登录成功");
					break;
				} else {
					count++;
					this.log.error("LS登录失败, 第" + count + "次重试");
					await System.sleepSeconds(1);
				}
			}
			if (count === 3) {
				this.log.error("LS登录失败, 超过3次重试");
				return;
			}
		}
		if (await LSRequest.getPersonalInformat()) {
			this.log.log("获取项目工作区信息成功");
		} else {
			this.log.error("获取项目工作区信息失败");
			return;
		}
		if(await LSRequest.getInfo()) {
			this.log.log("获取个人信息成功");
		} else {
			this.log.error("获取个人信息失败");
			return;
		}
		if (await LSRequest.getFillDailyReportName()) {
			this.log.log("获取日报名称成功");
		} else {
			this.log.error("获取日报名称失败");
			return;
		}
	}
	// 定时任务
	static async currentTask() {
		// 模块时间区间任务设置
		LSGlobal.setting.time_range_login_start
		const taskConfigs = [
			{
				start: LSGlobal.setting.time_range_login_start,
				end: LSGlobal.setting.time_range_login_end,
				action: async () => {
					if (await LSRequest.login()) {
						Message.notify({body: "LS 登录成功"});
						this.log.log("LS 登录成功");
					} else {
						Message.notify({body: "LS 登录失败"});
						this.log.error("LS 登录失败");
					}
				},
				name: LSGlobal.task.dailyTask.login
			},
			{
				start: LSGlobal.setting.time_range_login_out_start,
				end: LSGlobal.setting.time_range_login_out_end,
				action: async () => {
					if (await LSRequest.loginOut()) {
						Message.notify({body: "LS 登出成功"});
						this.log.log("LS 登出成功");
					} else {
						Message.notify({body: "LS 登出失败"});
						this.log.error("LS 登出失败");
					}
				},
				name: LSGlobal.task.dailyTask.loginOut
			},
			{
				start: LSGlobal.setting.time_range_fill_daily_report_start,
				end: LSGlobal.setting.time_range_fill_daily_report_end,
				action: async () => { 
					if(await LSRequest.fillDailyReport()) {
						Message.notify({body: "LS 日报填写成功"});
						this.log.log("LS 日报填写成功");
					} else {
						Message.notify({body: "LS 日报填写失败"});
						this.log.error("LS 日报填写失败");
					}
				},
				name: LSGlobal.task.dailyTask.fillDailyReport
			}
		]
		for (const config of taskConfigs) {
			TimerScheduler.setDailyTask(
				Time.getRandomTimeInRange(config.start, config.end),
				config.action,
				config.name
			);
		}
		this.log.log("今天是工作日, 定时任务已启动");
	}
}
class LSBehaviorUpdateUIElement extends LSBehavior {
	static async loginStatus() {
		this.login_status_label.innerText = LSGlobal.status.login;
	}
	static async getDailyReportList() {
		await LSRequest.getDailyReportList();
	}
	// 日报打卡状态
	static async fillDailyReportStatus() {
		// 如果检测到当天的记录, 就更新打卡成功
		let result = LSGlobal.cache.dailyReport.list;
		if (result === null) {
			return;
		}
		if (result.code === 200) {
			if (Time.isSameDay(result.rows[0].recordTime, Time.getCurrentDate())) {
				this.fill_daily_report_label.innerText = LSGlobal.statusMap.dailyReportStatus.already;
			} else {
				this.fill_daily_report_label.innerText = LSGlobal.statusMap.dailyReportStatus.not;
			}
		} else {
			this.fill_daily_report_label.innerText = LSGlobal.statusMap.unknown;
		}
	}
	// 日报列表
	static async dailyReportList() {
		const daily_report_list_loading = this.daily_report_list_loading;
		let result = LSGlobal.cache.dailyReport.list;
		if (result === null) {
			return;
		}
		daily_report_list_loading.classList.add("hidden");
		this.daily_report_list_table.innerHTML = '';
		if (result.code === 200) {
			result.rows.forEach(item => {
				const date = item.recordTime.split('T')[0];
				const hours = Math.floor(item.workHours);
				const minutes = Math.round((item.workHours - hours) * 60);
				// 创建单条记录容器
				const recordDiv = document.createElement('div');
				recordDiv.className = 'flex justify-between items-center bg-gray-50 hover:bg-blue-50 transition shadow-sm rounded-xl px-4 py-3 border border-gray-100';
				// 时间
				const timeDiv = document.createElement('div');
				timeDiv.className = 'flex flex-col';
				const timeLabel = document.createElement('span');
				timeLabel.className = 'text-gray-500 text-xs';
				timeLabel.textContent = '时间';
				const timeValue = document.createElement('span');
				timeValue.className = 'text-base font-semibold text-gray-800';
				timeValue.textContent = date;
				timeDiv.appendChild(timeLabel);
				timeDiv.appendChild(timeValue);
				// 标注数据量
				const labelDiv = document.createElement('div');
				labelDiv.className = 'flex flex-col text-center';
				const labelLabel = document.createElement('span');
				labelLabel.className = 'text-gray-500 text-xs';
				labelLabel.textContent = '标注数据量';
				const labelValue = document.createElement('span');
				labelValue.className = 'text-green-600 font-semibold text-base';
				labelValue.textContent = item.labelCount;
				labelDiv.appendChild(labelLabel);
				labelDiv.appendChild(labelValue);

				// 质检数据量
				const checkDiv = document.createElement('div');
				checkDiv.className = 'flex flex-col text-center';
				const checkLabel = document.createElement('span');
				checkLabel.className = 'text-gray-500 text-xs';
				checkLabel.textContent = '质检数据量';
				const checkValue = document.createElement('span');
				checkValue.className = 'text-blue-600 font-semibold text-base';
				checkValue.textContent = item.checkCount;
				checkDiv.appendChild(checkLabel);
				checkDiv.appendChild(checkValue);

				// 工作时长
				const workDiv = document.createElement('div');
				workDiv.className = 'flex flex-col text-center';
				const workLabel = document.createElement('span');
				workLabel.className = 'text-gray-500 text-xs';
				workLabel.textContent = '工作时长';
				const workValue = document.createElement('span');
				workValue.className = 'text-gray-800 font-semibold text-base';
				workValue.textContent = `${hours}h ${minutes}m`;
				workDiv.appendChild(workLabel);
				workDiv.appendChild(workValue);
				// 组合所有子元素
				recordDiv.appendChild(timeDiv);
				recordDiv.appendChild(labelDiv);
				recordDiv.appendChild(checkDiv);
				recordDiv.appendChild(workDiv);

				// 添加到容器
				this.daily_report_list_table.appendChild(recordDiv);
			})
		}
	}
}