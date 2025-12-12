class QLabel extends Page {
	constructor() {
		super();
	}
}
class QLabelWeb extends QLabel {
	constructor() {
		super();
	}
	init() {
		this.initValue();
		this.initTask();
		this.bindEvents();
		this.updateUIElement();
	}
	// 初始化任务, 先运行一次任务
	async initTask() {
		this.workHour();
		await this.annotationList();
		this.updateHomeworkLoadProgress();
		Framework.AllLoadedUIElement();
	}
	bindEvents() {
		// 查看上一天的作业数量
		this.prev_day_btn.addEventListener("click", async () => {
			this.setButtonsDisabled(true);
			QLabelGlobal.setting.annotationList.lookupTime.startTime--;
			QLabelGlobal.setting.annotationList.lookupTime.endTime--;
			await this.annotationList();
			this.setButtonsDisabled(false);
		});
		// 查看下一天的作业数量
		this.next_day_btn.addEventListener("click", async () => {
			this.setButtonsDisabled(true);
			QLabelGlobal.setting.annotationList.lookupTime.startTime++;
			QLabelGlobal.setting.annotationList.lookupTime.endTime++;
			// this.log.debug("QLabelGlobal.setting.annotationList.LookupTime.endTime", QLabelGlobal.setting.annotationList.LookupTime.endTime);
			await this.annotationList();
			this.setButtonsDisabled(false);
		});
		// 刷新当前的作业数量列表
		this.reflash_btn.addEventListener("click", async () => {
			this.setButtonsDisabled(true);
			await this.annotationList();
			this.setButtonsDisabled(false);
		});
		this.initDatePicker();
	}
	// 日期选择器
	initDatePicker() {
		const titleEl = this.annotation_list_title;

		// 创建面板DOM
		const picker = document.createElement("div");
		picker.id = "custom_datepicker";
		picker.className = "absolute bg-white shadow-lg rounded-xl p-4 mt-2 hidden z-50 w-72 border border-gray-300";

		// 顶部切换月份
		const headerDiv = document.createElement("div");
		headerDiv.className = "flex justify-between items-center mb-3";

		const prevBtn = document.createElement("button");
		prevBtn.id = "prev_month";
		prevBtn.className = "w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition";
		prevBtn.textContent = "<";

		const nextBtn = document.createElement("button");
		nextBtn.id = "next_month";
		nextBtn.className = "w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition";
		nextBtn.textContent = ">";

		const monthLabel = document.createElement("div");
		monthLabel.id = "datepicker_month_label";
		monthLabel.className = "font-semibold text-gray-700 text-center";

		headerDiv.appendChild(prevBtn);
		headerDiv.appendChild(monthLabel);
		headerDiv.appendChild(nextBtn);
		picker.appendChild(headerDiv);

		// 星期标题
		const weekDiv = document.createElement("div");
		weekDiv.className = "grid grid-cols-7 gap-1 text-center text-gray-500 text-sm font-medium";
		["日","一","二","三","四","五","六"].forEach(w => {
			const span = document.createElement("span");
			span.textContent = w;
			weekDiv.appendChild(span);
		});
		picker.appendChild(weekDiv);

		// 日期容器
		const daysContainer = document.createElement("div");
		daysContainer.id = "datepicker_days";
		daysContainer.className = "grid grid-cols-7 gap-1 mt-1";
		picker.appendChild(daysContainer);

		document.body.appendChild(picker);

		// 日期逻辑
		const today = new Date();
		today.setHours(0,0,0,0);
		let currentYear = today.getFullYear();
		let currentMonth = today.getMonth();
		let selectedDate = today;

		const renderCalendar = (year, month) => {
			monthLabel.textContent = `${year}-${(month+1).toString().padStart(2,'0')}`;
			daysContainer.innerHTML = ""; // 清空上一月

			const firstDay = new Date(year, month, 1).getDay();
			const daysInMonth = new Date(year, month+1, 0).getDate();

			for (let i=0;i<firstDay;i++){
				const empty = document.createElement("div");
				daysContainer.appendChild(empty);
			}

			for (let day=1; day<=daysInMonth; day++){
				const dayBtn = document.createElement("button");
				dayBtn.innerText = day;
				dayBtn.className = "w-8 h-8 flex items-center justify-center rounded-full text-center leading-none text-gray-700 font-medium hover:bg-blue-100 transition";

				const dayDate = new Date(year, month, day);
				const isToday = dayDate.getTime() === today.getTime();
				const isSelected = dayDate.getTime() === selectedDate.getTime();

				if (isToday) dayBtn.classList.add("bg-blue-300","text-white");
				if (isSelected) dayBtn.classList.add("bg-blue-500","text-white");

				dayBtn.addEventListener("click", async () => {
					selectedDate = new Date(year, month, day);

					// 计算偏移量
					const offsetStart = Math.floor((selectedDate - today)/(1000*60*60*24));
					const offsetEnd = offsetStart + 1;
					this.setButtonsDisabled(true);
					QLabelGlobal.setting.annotationList.lookupTime.startTime = offsetStart;
					QLabelGlobal.setting.annotationList.lookupTime.endTime = offsetEnd;
					picker.classList.add("hidden");
					await this.annotationList();
					this.setButtonsDisabled(false);
				});

				daysContainer.appendChild(dayBtn);
			}
		};

		prevBtn.addEventListener("click", () => {
			currentMonth--;
			if (currentMonth < 0) { currentMonth = 11; currentYear--; }
			renderCalendar(currentYear, currentMonth);
		});

		nextBtn.addEventListener("click", () => {
			currentMonth++;
			if (currentMonth > 11) { currentMonth = 0; currentYear++; }
			renderCalendar(currentYear, currentMonth);
		});

		// 点击标题显示面板
		titleEl.addEventListener("click", () => {
			const rect = titleEl.getBoundingClientRect();
			picker.style.top = rect.bottom + window.scrollY + "px";
			picker.style.left = rect.left + window.scrollX + "px";
			picker.classList.remove("hidden");
			renderCalendar(currentYear, currentMonth);
		});

		// 点击外部隐藏
		document.addEventListener("click", e => {
			if (!picker.contains(e.target) && e.target !== titleEl){
				picker.classList.add("hidden");
			}
		});
	}
	updateUIElement() {
		this.addTooltipMessage();
		let task = [
			{
				action: async () => {
					this.annotationList();
				},
				intervalMs: 1000 * 60 * 2,
				name: QLabelGlobal.task.uiTask.annotationList
			}, 
			{
				action: async () => {
					this.workHour();
				},
				intervalMs: 1000 * 60 * 1,
				name: QLabelGlobal.task.uiTask.workHour
			},
			{
				action: async () => {
					this.updateHomeworkLoadProgress();
				},
				intervalMs: 1000 * 1,
				name: QLabelGlobal.task.uiTask.homeworkLoadTatistics
			}
		];
		task.forEach(cofig => {
			TimerScheduler.setIntervalTask(
				cofig.action,
				cofig.intervalMs,
				cofig.name
			);
		});
	}
	async workHour() {
		let workedHours = parseFloat(Time.getWorkedHoursToday().toFixed(2));
		let remainHours = (8 - workedHours).toFixed(2);
		this.remain_hours_label.classList.remove("hidden");
		this.worked_hours_label.innerText = workedHours + " 小时";
		this.remain_hours_label.innerText = ", 距离下班还有 " + remainHours + " 小时";
	}
	addTooltipMessage() {
		// 未建设内容
		this.tooltip.addTooltip(this.login_status_div, "待建设");
		this.tooltip.addTooltip(this.homework_load_statistics_div, "目前仅统计标注题目数量");
		// 标注列表
		this.tooltip.addTooltip(this.prev_day_btn, "查看前一天的作业数量");
		this.tooltip.addTooltip(this.next_day_btn, "查看后一天的作业数量");
		this.tooltip.addTooltip(this.reflash_btn, "刷新作业数量列表");

	}
	initValue() {
		this.domMap = QLabelGlobal.domMap;
		Object.entries(this.domMap).forEach(([key, selectorDomID]) => {
			this[key] = DomHelper.bySelector(selectorDomID);
		});
	}
	setButtonsDisabled(disabled) {
		this.prev_day_btn.disabled = disabled;
		this.next_day_btn.disabled = disabled;
		this.reflash_btn.disabled = disabled;

		if (disabled) {
			this.annotation_list_loading.classList.remove("hidden");
			this.prev_day_btn.classList.add("opacity-50", "pointer-events-none");
			this.next_day_btn.classList.add("opacity-50", "pointer-events-none");
			this.reflash_btn.classList.add("opacity-50", "pointer-events-none");
		} else {
			this.annotation_list_loading.classList.add("hidden");
			this.prev_day_btn.classList.remove("opacity-50", "pointer-events-none");
			this.next_day_btn.classList.remove("opacity-50", "pointer-events-none");
			this.reflash_btn.classList.remove("opacity-50", "pointer-events-none");
		}
	}
	updateHomeworkLoadProgress() {
		// 计算总时长
		let totalHours = 0;
		for (let h of QLabelGlobal.setting.homeworkLoadStatistics.hourList) {
			let v = Number(h);
			if (!isNaN(v) && v > 0) {
				totalHours += v;
			}
		}

		// 找到进度条
		const bar = this.homework_load_tatistics_bar;
		const backgroundBar = this.homework_load_tatistics_background_bar;
		if (!bar) return;

		// 计算百分比（满额 8 小时）
		let percent = Math.min((totalHours / 8) * 100, 100);

		// 更新样式
		bar.style.width = percent.toFixed(0) + "%";

		// 进度条提示
		this.tooltip.addTooltip(backgroundBar, totalHours.toFixed(2) + " / 8 小时");
	}

	// 标注和质检列表
	async annotationList() {
		const container = this.annotation_list_table;
		if (!container) return;

		// 获取标注和质检数据
		const result1 = await QLabelRequest.getTotalAnnotationsList();
		const result2 = await QLabelRequest.getQualityInspectionList();
		
		// 清空容器
		container.innerHTML = "";
		QLabelGlobal.setting.homeworkLoadStatistics.hourList = [];
		
		// 更改列表标题
		let startTime = QLabelGlobal.setting.annotationList.lookupTime.startTime;
		let endTime = QLabelGlobal.setting.annotationList.lookupTime.endTime;
		this.annotation_list_title.innerText = Time.getDateRangeByToday(startTime, endTime)[0];

		// 合并数据并加 _type
		const mergedData = [];
		result1.result.data.forEach(item => mergedData.push({ ...item, _type: "annotation" }));
		result2.result.data.forEach(item => mergedData.push({ ...item, _type: "inspection" }));

		// 当天没有数据
		if (mergedData.length === 0) {
			let emptyBox = DomHelper.createDom("div");
			emptyBox.id = "annotation_list_empty_label";
			emptyBox.classList.add(
				"flex", "flex-col",
				"items-center", "justify-center",
				"h-[75px]", "text-gray-400", "select-none"
			);

			const icon = document.createElement("i");
			icon.classList.add("fa-regular", "fa-folder-open", "text-4xl", "mb-3");

			const text = document.createElement("div");
			text.classList.add("text-sm");
			text.textContent = "当前没有标注记录喔";

			emptyBox.appendChild(icon);
			emptyBox.appendChild(text);
			container.appendChild(emptyBox);
		}

		// 初始化 tasknameAndIndicators
		if (!QLabelGlobal.setting.annotationList.tasknameAndIndicators) {
			QLabelGlobal.setting.annotationList.tasknameAndIndicators = [];
		}

		let tempIndicators = [...QLabelGlobal.setting.annotationList.tasknameAndIndicators];

		// 遍历生成行
		for (let i = 0; i < mergedData.length; i++) {
			const item = mergedData[i];

			// 创建行
			const row = DomHelper.createDom("div");
			row.setAttribute("id", item._type + "_list_" + i + "_row");
			row.classList.add(
				"grid", "grid-cols-[63%_5%_8.5%_7.5%_8.5%_8.5%]",
				"flex", "justify-between", "items-center",
				"transition", "shadow-sm", "rounded-xl", 
				"px-4", "py-3", "border", "border-gray-100",
				"bg-gray-50", "hover:bg-blue-50"
			);

			// 任务名称
			const taskDiv = document.createElement("div");
			taskDiv.classList.add("flex", "flex-col");
			const taskLabel = document.createElement("span");
			taskLabel.classList.add("text-gray-500", "text-xs");
			taskLabel.textContent = "任务名称";
			const taskValue = document.createElement("span");
			taskValue.classList.add("text-base", "font-semibold", "text-gray-800");
			taskValue.textContent = item.task_name || "--";
			taskDiv.appendChild(taskLabel);
			taskDiv.appendChild(taskValue);
			row.appendChild(taskDiv);

			// 数量
			const numDiv = document.createElement("div");
			numDiv.classList.add("flex", "flex-col");
			const numLabel = document.createElement("span");
			numLabel.classList.add("text-gray-500", "text-xs");
			numLabel.textContent = "数量";
			const numValue = document.createElement("span");
			numValue.classList.add("text-base", "font-semibold", "text-gray-800");
			numValue.textContent = item.total_labeled_num !== undefined ? item.total_labeled_num : "--";
			numDiv.appendChild(numLabel);
			numDiv.appendChild(numValue);
			row.appendChild(numDiv);

			// 标注/质检总时长
			const durationDiv = document.createElement("div");
			durationDiv.classList.add("flex", "flex-col");
			const durationLabel = document.createElement("span");
			durationLabel.classList.add("text-gray-500", "text-xs");
			durationLabel.textContent = item._type === "annotation" ? "标注总时长" : "质检总时长";
			const durationValue = document.createElement("span");
			durationValue.classList.add("text-base", "font-semibold", "text-gray-800");
			durationValue.textContent = item.labeled_duration_hour || "--";
			durationDiv.appendChild(durationLabel);
			durationDiv.appendChild(durationValue);
			row.appendChild(durationDiv);

			// 绩效指标
			const performanceDiv = document.createElement("div");
			performanceDiv.classList.add("flex", "flex-col");
			const performanceLabel = document.createElement("span");
			performanceLabel.classList.add("text-gray-500", "text-xs");
			performanceLabel.textContent = "绩效指标";
			const performanceValue = document.createElement("span");
			performanceValue.classList.add("text-base", "font-semibold", "text-gray-800", "cursor-pointer");

			// 当前任务时长
			const calcDiv = document.createElement("div");
			calcDiv.classList.add("flex", "flex-col");
			const calcLabel = document.createElement("span");
			calcLabel.classList.add("text-gray-500", "text-xs");
			calcLabel.textContent = "当前任务时长";
			const calcValue = document.createElement("span");
			calcValue.classList.add("text-base", "font-semibold", "text-gray-800");

			// 查找已有绩效指标
			let existingIndex = tempIndicators.findIndex(v => v.taskname === item.task_name);
			let indicatorValue = existingIndex >= 0 ? tempIndicators[existingIndex].indicators : null;
			performanceValue.textContent = indicatorValue !== null ? indicatorValue : "--";

			// 计算当前任务时长
			if (indicatorValue !== null && item.total_labeled_num > 0) {
				let hours = Number((item.total_labeled_num / indicatorValue).toFixed(2));
				calcValue.textContent = hours;
				QLabelGlobal.setting.homeworkLoadStatistics.hourList.push(hours);
			} else {
				calcValue.textContent = "--";
			}

			// 点击修改绩效指标
			performanceValue.addEventListener("click", () => {
				if (performanceDiv.querySelector("input")) return;

				const input = document.createElement("input");
				input.type = "number";
				input.value = performanceValue.textContent === "--" ? "0" : performanceValue.textContent;
				input.classList.add("text-base", "font-semibold", "text-gray-800");
				input.style.width = "4rem";
				input.style.outline = "none";
				input.style.border = "none";
				input.style.background = "transparent";
				input.style.padding = "0";
				input.style.margin = "0";

				performanceValue.style.display = "none";
				performanceDiv.appendChild(input);
				input.focus();
				input.select();

				input.addEventListener("blur", () => {
					let val = Number(input.value);
					if (isNaN(val) || val <= 0) {
						performanceValue.textContent = "--";
						calcValue.textContent = "--";
					} else {
						performanceValue.textContent = val;

						// 更新当前任务时长
						let total = Number(item.total_labeled_num || 0);
						let newHour = total > 0 ? Number((total / val).toFixed(2)) : null;
						calcValue.textContent = newHour !== null ? newHour : "--";

						// 更新 hourList（重新计算全部）
						let newHourList = [];
						document.querySelectorAll("[id$='_row']").forEach((row, idx) => {
							if (idx === i) {
								if (newHour !== null) newHourList.push(newHour);
							} else {
								let h = QLabelGlobal.setting.homeworkLoadStatistics.hourList[idx];
								if (h !== undefined) newHourList.push(h);
							}
						});
						QLabelGlobal.setting.homeworkLoadStatistics.hourList = newHourList;

						// 更新指标
						if (existingIndex >= 0) {
							tempIndicators[existingIndex].indicators = val;
						} else {
							tempIndicators.push({ taskname: item.task_name, indicators: val });
							existingIndex = tempIndicators.length - 1;
						}
						QLabelGlobal.setting.annotationList.tasknameAndIndicators = [...tempIndicators];
					}

					performanceDiv.removeChild(input);
					performanceValue.style.display = "";
				});
			});

			// 填充绩效指标
			performanceDiv.appendChild(performanceLabel);
			performanceDiv.appendChild(performanceValue);
			row.appendChild(performanceDiv);

			// 填充当前任务时长
			calcDiv.appendChild(calcLabel);
			calcDiv.appendChild(calcValue);
			row.appendChild(calcDiv);

			const expectDiv = document.createElement("div");
			expectDiv.classList.add("flex", "flex-col");

			const expectLabel = document.createElement("span");
			expectLabel.classList.add("text-gray-500", "text-xs");
			expectLabel.textContent = "期望完成数量";

			const expectValue = document.createElement("span");
			expectValue.classList.add("text-base", "font-semibold", "text-gray-800");

			const calcExpect = () => {
				let kpi = Number(performanceValue.textContent);
				let usedHours = 0;
				QLabelGlobal.setting.homeworkLoadStatistics.hourList.forEach(v => { usedHours += Number(v); });
				if (isNaN(kpi) || kpi <= 0) return "--";
				let result = (8 - usedHours) * kpi;
				if (isNaN(result)) return "--";
				return Math.max(0, Math.floor(result));
			};

			expectValue.textContent = calcExpect();

			performanceValue.addEventListener("DOMSubtreeModified", () => {
				expectValue.textContent = calcExpect();
			});

			calcValue.addEventListener("DOMSubtreeModified", () => {
				expectValue.textContent = calcExpect();
			});

			expectDiv.appendChild(expectLabel);
			expectDiv.appendChild(expectValue);
			row.appendChild(expectDiv);

			// 点击复制支持
			const addCopySupport = (el, textGetter) => {
				this.tooltip.addTooltip(el, "点击复制");
				el.addEventListener("click", () => {
					const text = textGetter();
					if (!text || text === "--") return;
					navigator.clipboard.writeText(text)
						.then(() => this.tooltip.show("复制完成", el))
						.catch(err => this.log.error("复制失败:", err));
				});
			};

			addCopySupport(taskValue, () => item.task_name);
			addCopySupport(numValue, () => String(item.total_labeled_num));
			addCopySupport(durationValue, () => String(item.labeled_duration_hour));

			container.appendChild(row);
		}

		annotation_list_loading.classList.add("hidden");
	}
}
class QLabelWork extends QLabel {
	constructor() {
		super();
	}
	init() {
		this.log.log("QLabelWork 逻辑已加载");
	}

}
class QLabelWorkLookup extends QLabel {
	constructor() {
		super();
	}
	init() {
		GM.CookieList({}, list => {
			const session = list.find(c => c.name === "SESSION");
			QLabelWorkLookupGlobal.cache.cookie.session = session.value;
			this.log.log("SESSION:", session?.value);
		});

		GM.CookieList({}, list => {
			const route = list.find(c => c.name === "tgw_l7_route");
			QLabelWorkLookupGlobal.cache.cookie.route = route.value;
			this.log.log("tgw_l7_route:", route?.value);
		});
		this.log.log("QLabelLookupPage 逻辑已加载");
	}
}
class QLabelRequest extends QLabel {
	constructor() {
		super();
	}
	static log = new Logger("QLabelRequest");
	// 获取标注总量列表
	static async getTotalAnnotationsList() {
		return await this._workbenchUserWorkingReport("total_annotations");
	}
	// 获取质检总量列表
	static async getQualityInspectionList() {
		return await this._workbenchUserWorkingReport("quality_inspection");
	}
	static async _workbenchUserWorkingReport(stat_type) {
		if (stat_type == "total_annotations") {
			stat_type = 1;
		} else if (stat_type == "quality_inspection") {
			stat_type = 2;
		}
		let startTime = QLabelGlobal.setting.annotationList.lookupTime.startTime;
		let endTime = QLabelGlobal.setting.annotationList.lookupTime.endTime;
		const url = "https://qlabel.tencent.com/api/report/workbenchUserWorkingReport";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			"sw8": "1-ZjE3NGEzMTMtN2EwYS00MzE5LTgxNDEtNWQ3NjRkNDM4YmZk-YmZkODkxZDYtOTg5OC00OWFhLWExMzUtYTFlNzkyNTdlNTk1-1-YWVnaXM=-MS40My43-L3dvcmtiZW5jaC93b3JrLXRpbWU=-cWxhYmVsLnRlbmNlbnQuY29t",
			"Cookie": "SESSION=" + 
				QLabelWorkLookupGlobal.cache.cookie.session +
				"; tgw_l7_route=" + 
				QLabelWorkLookupGlobal.cache.cookie.route
		};
		const data = {
			"jsonrpc": "2.0",
			"method": "workbenchUserWorkingReport",
			"id": 1763976310742,
			"params": {
				"page": {
					"start": 0,
					"size": 10,
					"return_total": 1
				},
				"user_id": "",
				"nick_name": "",
				"company_name": "",
				"task_id": "",
				"task_name": "",
				"team_id": "",
				"team_name": "",
				"template_level": "",
				"template_scene": "",
				"stat_type": stat_type,
				"cycle_step": 0,
				"begin_date": Time.getDateRangeByToday(startTime, endTime)[0] + " 00:00:00",
				"end_date": Time.getDateRangeByToday(startTime, endTime)[1] + " 00:00:00"
			}
		};
		this.log.log("_workbenchUserWorkingReport data", data);
		const result = await this._request("POST", url, headers, data);

		this.log.log("_workbenchUserWorkingReport result: ", result);
		
		return result;
	}
	// ***************************
	// * 
	// * QLabelWorkRequest
	// * 
	// ***************************
	// 获取当前题目信息
	static async listMyDetail() {
		const url = "https://qlabel.tencent.com/api/workbench/listMyDetail";

		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			"sw8": "1-ZjE3NGEzMTMtN2EwYS00MzE5LTgxNDEtNWQ3NjRkNDM4YmZk-YmZkODkxZDYtOTg5OC00OWFhLWExMzUtYTFlNzkyNTdlNTk1-1-YWVnaXM=-MS40My43-L3dvcmtiZW5jaC93b3JrLXRpbWU=-cWxhYmVsLnRlbmNlbnQuY29t",
			"Cookie": "SESSION=" + 
				QLabelWorkLookupGlobal.cache.cookie.session +
				"; tgw_l7_route=" + 
				QLabelWorkLookupGlobal.cache.cookie.route
		};

		const data = {
			"jsonrpc": "2.0",
			"method": "listMyDetail",
			"id": 1765529342497,
			"params": {
				"task_id": "1191472240708845568",
				"pack_keys": [
					"cf5fc4df4189100a0ad0b718174f9713"
				],
				"need_check_info": 1,
				"cycle_step": 0,
				"need_deliver_info": true,
				"need_template_info": 0,
				"source": 7
			}
		};

		this.log.log("listMyDetail data", data);
		const result = await this._request("POST", url, headers, data);

		this.log.log("listMyDetail result: ", result);
		
		return result;
	}
	// 获取所有标注任务列表
	static async getListLabelTasks() {
		const url = "https://qlabel.tencent.com/api/workbench/listLabelTasks";

		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			"sw8": "1-ZjE3NGEzMTMtN2EwYS00MzE5LTgxNDEtNWQ3NjRkNDM4YmZk-YmZkODkxZDYtOTg5OC00OWFhLWExMzUtYTFlNzkyNTdlNTk1-1-YWVnaXM=-MS40My43-L3dvcmtiZW5jaC93b3JrLXRpbWU=-cWxhYmVsLnRlbmNlbnQuY29t",
			"Cookie": "SESSION=" + 
				QLabelWorkLookupGlobal.cache.cookie.session +
				"; tgw_l7_route=" + 
				QLabelWorkLookupGlobal.cache.cookie.route
		};

		const data = {
			"jsonrpc": "2.0",
			"method": "listLabelTasks",
			"id": 1765531865477,
			"params": {
				"page": {
					"start": 0,
					"size": 10,
					"return_total": 1
				},
				"sort": [
					[
						"a.created_at",
						"desc"
					]
				]
			}
		};

		this.log.log("getListLabelTasks data", data);
		const result = await this._request("POST", url, headers, data);

		this.log.log("getListLabelTasks result: ", result);

		const targetName = "图+视频生文-SFT-GUI-屏幕可交互组件-检测模型1126_macapp-凌波微步-251127";
		let targetTaskId = null;

		result.result.data.forEach(item => {
			if (item.task_name === targetName) {
				targetTaskId = item.task_id;
			}
		});

		this.log.debug("task_id:", targetTaskId);

		return result;
	}


	static async _request(method, url, headers, data) {
		return await HttpRequest.fetch({
			method,
			url,
			headers,
			data,
			responseType: "json",
		});
	}
}