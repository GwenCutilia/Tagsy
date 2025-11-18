class Page {
	// 静态属性: 日志和路由配置
	static log = new Logger("Page");
	static routes = {
		"Login.html": () => new Login(),
		"Index.html": () => new Index(),
		"W2.html": () => new W2(),
		"QLabel.html": () => new QLabel(),
		"LS.html": () => new LS(),
		"Setting.html": () => new Setting(),
		// 可添加其他页面路由
	};

	// 实例属性: 每个页面实例的日志
	constructor() {
		this.log = new Logger(this.constructor.name);
	}

	// 静态方法: 初始化页面路由
	static async init() {
		Template.init();
		const page = location.pathname.split("/").pop();
		if (this.routes[page]) {
			this.routes[page]();
		} else {
			this.log.error("没有为该页面配置逻辑:", page);
		}
	}

	// // 静态方法: 初始化页面路由
	// static async init() {
	// 	const page = location.pathname.split("/").pop();

	// 	if (!this.routes[page]) {
	// 		this.log.error("没有为该页面配置逻辑:", page);
	// 		return;
	// 	}

	// 	// 如果不是 Login.html，执行初始化逻辑
	// 	if (page !== "Login.html") {
	// 		await Template.init();
	// 		new Framework();
	// 	}

	// 	// 执行页面对应的逻辑
	// 	this.routes[page]();
	// }

	bindEvents() {

	}
}
class Template {
	static log = new Logger("Template");
	static async init() {
		if (!this.isTemplatePage()) {
			return;
		}
		this.loadTask();
		this.loadFramework();
		this.log.log('Template初始化完成');
	}
	// 初始化框架
	static async loadFramework() {
		W2Request.getLoginPage();
		this.initPage();
		new Framework();
	}

	static async loadTask() {
		this.W2Task();
		this.LSTask();
		// 为每日任务写单独的函数出来
		// 在登录成功后禁用登录按钮 待定, 有空再看看要不要添加这个功能
		// 添加一个重新登录的按钮监听事件
		// 当前任务卡有bug, 每一次更新ui时将所有ui更新
	}
	static isTemplatePage() {
		return location.pathname.includes('/Template/');
	}
	// 页面跳转
	static async initPage() {
		if (location.pathname.endsWith("Login.html")) {
			if (Global.config.cache.login_status === true) {
				location.href = "./Index.html";
			}
			return;
		}

		if (Global.config.cache.login_status === false) {
			location.href = "./Login.html";
		}
	}
	// W2任务
	static async W2Task() {
		await W2.login();
		await W2.intervalTask();
		await W2.currentTask();
	}
	static async LSTask() {
		await LS.login();
		await LS.currentTask();
	}
}
class Login extends Page {
	constructor() {
		super();
		this.init();
		this.bindEvents();
		this.updateUIElement();
		this.addAanimationEffect();
	}
	init() {
		this.initValue();
	}
	initValue() {
		// 背景
		this.animation_canvas = DomHelper.bySelector("#animation_canvas");
		// 用户名&&密码
		this.infomation_div = DomHelper.bySelector("#infomation_div");
		this.password_toggle_btn = DomHelper.bySelector("#password_toggle_btn");
		this.username_input = DomHelper.bySelector("#username_input");
		this.password_input = DomHelper.bySelector("#password_input");
		// 登录&&注册
		this.login_btn = DomHelper.bySelector("#login_btn");
		this.register_btn = DomHelper.bySelector("#register_btn");
		// 二维码
		this.qr_div = DomHelper.bySelector("#qr_div");
		this.qr_toggle_btn = DomHelper.bySelector("#qr_toggle_btn");
		this.qr_url_img = DomHelper.bySelector("#qr_url_img");
	}
	updateUIElement() {
		
	}
	bindEvents() {
		this.togglePasswordMask();
		this.loginUserName();
		this.regAccountForBtn();
		this.regAccountForQrBtn();
	}
	// 显示密码
	togglePasswordMask() {
		// 密码显示切换
		const password_toggle_btn = this.password_toggle_btn;
		const password_input = this.password_input;
		password_toggle_btn.addEventListener('click', () => {
			const type = password_input.getAttribute('type') === 'password' ? 'text' : 'password';
			password_input.setAttribute('type', type);
			password_toggle_btn.classList.toggle('fa-eye');
			password_toggle_btn.classList.toggle('fa-eye-slash');
		});
	}
	loginUserName() {
		// 登录按钮
		const login_btn = this.login_btn;
		const username_input = this.username_input;
		const password_input = this.password_input;
		login_btn.addEventListener('click', async () => {
			Global.config.login.user_name = username_input.value;
			Global.config.login.user_password = password_input.value;
			let result = await ApiboxRequest.loginAccount();
			if (result.code == 200) {
				this.log.log("登录成功");
				Global.config.cache.login_status = true;
				location.href = "./Index.html";
			}
		});
	}
	regAccountForBtn() {
		const register_btn = this.register_btn;
		register_btn.addEventListener('click', async () => {
			this.toggleQrMask();
		});
	}
	regAccountForQrBtn() {
		// 二维码切换逻辑
		const qr_toggle_btn = this.qr_toggle_btn;
		qr_toggle_btn.addEventListener('click', async () => {
			this.toggleQrMask();
		});
	}
	// 切换二维码区域的遮罩状态
	async toggleQrMask() {
		const infomation_div = this.infomation_div;
		const qr_div = this.qr_div;
		const form_visible = infomation_div.classList.contains('opacity-100');

		if (form_visible) {
			infomation_div.classList.replace('opacity-100', 'opacity-0');
			infomation_div.classList.add('pointer-events-none');
			
			qr_div.classList.replace('opacity-0', 'opacity-100');
			qr_div.classList.remove('pointer-events-none');
			await this.regAccountAddQrLogin();
		} else {
			infomation_div.classList.replace('opacity-0', 'opacity-100');
			infomation_div.classList.remove('pointer-events-none');

			qr_div.classList.replace('opacity-100', 'opacity-0');
			qr_div.classList.add('pointer-events-none');
		}
	}
	async regAccountAddQrLogin() {
		const qr_url_img = this.qr_url_img;

		let result;
		result = await ApiboxRequest.getQrCode();
		if (result.code == 200) {
			qr_url_img.src = result.logqrcode;
			Global.config.login.query_id = result.cxid;
		}
		await System.sleepSeconds(5);
		let i = 0;
		let loginStatusFlag = true;
		while(loginStatusFlag && i <= 5) {
			result = await ApiboxRequest.queryLogin();
			if (result.code == 200) {
				loginStatusFlag = false;
				// 验证登录
				const result1 = await ApiboxRequest.verifyLogin();
				if (result1.code == 200) {
					Global.config.login.user_name = result1.name;
					Global.config.login.user_password = result1.pwd;
				} else if (result1.msg.includes("未查询到账号")) {
					// 注册账号
					Global.config.login.user_name = result.nickname;
					Global.config.login.user_avatar_url = result.faceimg;
					Global.config.login.user_password = "000000";
					await ApiboxRequest.regAccount();
					// 绑定账号
					Global.config.login.user_nick_name = result.nickname;
					Global.config.login.user_uid = result.social_uid;
					await ApiboxRequest.bindAccount();
					await ApiboxRequest.loginAccount();
				} else {
					this.log.log("登录失败");
				}
				// 登录后的操作
				Global.config.cache.login_status = true;
				Global.config.login.user_name = result1.name;
				Global.config.login.user_password = result1.pwd;
				location.href = "./Index.html";
				this.log.log("登录成功");
			}
			await System.sleepSeconds(10);
			i++;
		}
		if (i == 6) {
			// 重新获取验证码
			const overlay = document.getElementById("qr_retry_overlay");
			overlay.classList.remove("opacity-0", "pointer-events-none");
			this.log.error("登录超时");
		}
	}
	addAanimationEffect() {
		this.addParticleEffects();
	}

	// 给背景添加粒子动画
	addParticleEffects() {
		const canvas = this.animation_canvas;
		const ctx = canvas.getContext("2d");
		let width, height;

		function resize() {
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width;
			canvas.height = height;
		}
		window.addEventListener("resize", resize);
		resize();

		class Particle {
			constructor() {
				this.reset();
			}
			reset() {
				this.x = Math.random() * width;
				this.y = Math.random() * height;
				this.size = 1 + Math.random() * 5;
				this.speedX = (Math.random() - 0.5) * 0.5;
				this.speedY = (Math.random() - 0.5) * 0.5;
				this.opacity = 0.1 + Math.random() * 0.4;
			}
			update() {
				this.x += this.speedX;
				this.y += this.speedY;
				if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
					this.reset();
				}
			}
			draw(ctx) {
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(13, 148, 136, " + this.opacity + ")"; // Tailwind teal-600
				ctx.fill();
			}
		}

		const particles = [];
		const PARTICLE_COUNT = 80;
		for (let i = 0; i < PARTICLE_COUNT; i++) {
		particles.push(new Particle());
		}

		function animate() {
			ctx.clearRect(0, 0, width, height);
			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				p.update();
				p.draw(ctx);
			}
			requestAnimationFrame(animate);
		}
		animate();
	}
}
class Index extends Page {
	constructor() {
		super();
		this.init();
		this.bindEvents();
		this.updateUIElement();
	}
	async init() {
		// 加载状态
		this.loading_status_label = DomHelper.bySelector("#loading_status_label");
		this.load_btn = DomHelper.bySelector("#load_btn");
		this.unload_btn = DomHelper.bySelector("#unload_btn");
		// 运行状态
		this.running_status_label = DomHelper.bySelector("#running_status_label");
		this.running_start_btn = DomHelper.bySelector("#running_start_btn");
		this.running_stop_btn = DomHelper.bySelector("#running_stop_btn");
		// 工作时间
		this.worked_hours_label = DomHelper.bySelector("#worked_hours_label");
		this.remain_hours_label = DomHelper.bySelector("#remain_hours_label");
		// 日志
		this.running_log_content = DomHelper.bySelector("#running_log_content");
		this.clear_log_btn = DomHelper.bySelector("#clear_log_btn");
	}
	bindEvents() {
		this.load_btn.addEventListener("click", async () => {
			await ResourceLoader.loadAllResources();
		});
	}
	async updateUIElement() {
		let task = [
			{
				// 加载状态
				action: async () => { 
					await this.loadingStatusTask();
				},
				intervalMs: 3000,
				name: "INDEX_LOADING_STATUS_TASK",
			},
			{
				// 工作时间
				action: async () => {
					await this.workHourTask();
				},
				intervalMs: 3000,
				name: "INDEX_WORK_HOUR_TASK",
			}
		]
		task.forEach(config => {
			TimerScheduler.setIntervalTask(
				config.action, 
				config.intervalMs, 
				config.name
			);
		});
	}
	async loadingStatusTask() {
		// 加载状态
		this.loadingStatusValue = this.loading_status_label;
		if (Resource.AllLoaded()) {
			this.loadingStatusValue.innerText = "已加载";
		} else {
			this.loadingStatusValue.innerText = "加载异常";
		}
	}
	async runningStatusTask() {

	}
	async workHourTask() {
		let workedHours = parseFloat(Time.getWorkedHoursToday().toFixed(2));
		let remainHours = (8 - workedHours).toFixed(2);
		this.remain_hours_label.classList.remove("hidden");
		this.worked_hours_label.innerText = workedHours + " 小时";
		this.remain_hours_label.innerText = ", 距离下班还有 " + remainHours + " 小时";
	}
}
class W2 extends Page {

	static status = {
		not_login: "未登录",
		logining: "登录中",
		login_success: "已登录",
		login_failed: "登录失败",
		unknown: "--"
	}
	static currentTaskStatus = {
		workIn: "上班打卡",
		meal: "前往用餐", 
		working: "切换标注",
		workOut: "下班打卡",
	}
	static workHourStatus = {
		working: "正在标注",
		meal: "前往用餐"
	};
	static workingStatus = {
		not_check_in: "未打卡",
		already_check_in: "已打卡",
		already_check_out: "已下班"
	};

	constructor() {
		super();
		this.init();
		this.bindEvents();
		this.updateUIElement();
		this.addAanimationEffect(); // 添加动画效果
	}

	async init() {
		// 待优化, 将其他h5中的页面的拖动效果取消
		// 初始化Dom
		this.tooltip = new ToolTip();
		// 登录状态
		this.login_status_label = DomHelper.bySelector("#login_status_label"); // 登录状态
		this.login_btn = DomHelper.bySelector("#login_btn"); // 登录按钮
		this.relogin_btn = DomHelper.bySelector("#relogin_btn"); // 重新登录按钮
		this.login_out_btn = DomHelper.bySelector("#login_out_btn"); // 退出登录按钮
		// 考勤状态
		this.check_in_out_label = DomHelper.bySelector("#check_in_out_label"); // 考勤打卡状态
		this.check_in_btn = DomHelper.bySelector("#check_in_btn"); // 打卡按钮
		this.check_out_btn = DomHelper.bySelector("#check_out_btn"); // 下班按钮
		// 工作状态
		this.meal_working_status_label = DomHelper.bySelector("#meal_working_status_label"); // 工作状态
		this.meal_working_status_btn = DomHelper.bySelector("#meal_working_status_btn"); // 切换状态按钮
		// 任务线
		this.current_time_line_task_start_btn = DomHelper.bySelector("#current_time_line_task_start_btn"); // 开始W2任务按钮
		this.current_time_line_task_stop_btn = DomHelper.bySelector("#current_time_line_task_stop_btn"); // 停止W2任务按钮
		// 任务开关
		this.current_time_line_task_turn_on_off_i = DomHelper.bySelector("#current_time_line_task_turn_on_off_i"); // 任务开关图标
		// 待优化, 图标全部改成font-awesome图标
		this.current_time_line_task_icon_0 = DomHelper.bySelector("#current_time_line_task_icon_0"); // 任务1图标
		this.current_time_line_task_icon_1 = DomHelper.bySelector("#current_time_line_task_icon_1"); // 任务2图标
		this.current_time_line_task_icon_2 = DomHelper.bySelector("#current_time_line_task_icon_2"); // 任务3图标
		this.current_time_line_task_icon_3 = DomHelper.bySelector("#current_time_line_task_icon_3"); // 任务4图标
		this.current_time_line_task_label_0 = DomHelper.bySelector("#current_time_line_task_label_0"); // 任务1标签
		this.current_time_line_task_label_1 = DomHelper.bySelector("#current_time_line_task_label_1"); // 任务2标签
		this.current_time_line_task_label_2 = DomHelper.bySelector("#current_time_line_task_label_2"); // 任务3标签
		this.current_time_line_task_label_3 = DomHelper.bySelector("#current_time_line_task_label_3"); // 任务4标签
		// 排班列表
		this.calendar_loading = DomHelper.bySelector("#calendar_loading");
		this.calendar_label = DomHelper.bySelector("#calendar_label"); // 日历月份
		this.calendar_title = DomHelper.bySelector("#calendar_title"); // 日历标题
		this.calendar_table = DomHelper.bySelector("#calendar_table"); // 日历主体
		this.prev_month_btn = DomHelper.bySelector("#prev_month_btn"); // 查看上个月排班按钮
		this.next_month_btn = DomHelper.bySelector("#next_month_btn"); // 查看下个月排班按钮
		// 抽调申请
		this.apply_activity_transfer_btn = DomHelper.bySelector("#apply_activity_transfer_btn"); // 申请抽调按钮
		this.apply_activity_transfer_type_div = DomHelper.bySelector("#apply_activity_transfer_type_div"); // 申请抽调类型
		this.apply_activity_transfer_type_label = DomHelper.bySelector("#apply_activity_transfer_type_label"); // 申请抽调类型标签
		this.apply_activity_transfer_type_ul = DomHelper.bySelector("#apply_activity_transfer_type_ul"); // 申请抽调类型列表
		this.apply_activity_transfer_time_text = DomHelper.bySelector("#apply_activity_transfer_time_text"); // 申请抽调时间
		this.apply_activity_transfer_momo_text = DomHelper.bySelector("#apply_activity_transfer_momo_text"); // 申请抽调备注
		this.info_message_box = DomHelper.bySelector("#info_message_box"); // 信息提示框
		this.error_message_box = DomHelper.bySelector("#error_message_box"); // 错误提示框
		// 抽调列表
		this.apply_activity_transfer_loading = DomHelper.bySelector("#apply_activity_transfer_loading"); // 加载图标
		this.apply_activity_transfer_label = DomHelper.bySelector("#apply_activity_transfer_label"); // 申请抽调列表标签
		this.apply_activity_transfer_table = DomHelper.bySelector("#apply_activity_transfer_table"); // 申请抽调列表表格
		this.apply_activity_transfer_prev_page_btn = DomHelper.bySelector("#apply_activity_transfer_prev_page_btn"); // 抽调列表上一页按钮
		this.apply_activity_transfer_next_page_btn = DomHelper.bySelector("#apply_activity_transfer_next_page_btn"); // 抽调列表下一页按钮
		this.apply_activity_transfer_refresh_page_btn = DomHelper.bySelector("#apply_activity_transfer_refresh_page_btn"); // 抽调列表刷新按钮
	}
	// 登录W2
	static async login() {
		if (await W2.isLoginStatus()) {
			Global.config.w2.login_status = W2.status.login_success;
			this.log.log("W2已登录, 无需重复登录");
			W2.loginCheck();
			return;
		}
		let result;
		this.log.log("正在进行登录W2操作...");
		Global.config.w2.login_status = W2.status.logining;
		result = await W2Request.getVerifyCode(); // 直接返回状态信息
		this.log.debug("getVerifyCode: ", result);
		if (result.code !== 200) {
			Global.config.w2.login_status = W2.status.login_failed;
			this.log.error("获取验证码失败, 请检查账户信息");
			return;
		}
		this.log.log("验证码已发送, 等待接收");
		// await System.sleepSeconds(5);
		result = await ApiboxRequest.getEmailApi();
		if (result.code !== 200) {
			Global.config.w2.login_status = W2.status.login_failed;
			this.log.error("获取邮件失败, 请检查邮箱API信息");
			return;
		}
		this.log.debug("邮箱API结果: ", result);
		// Global.config.w2.email_api_verify_code = result.data.data[0].content.match(new RegExp("\\d{6}", "g"))[0];
		Global.config.w2.email_api_verify_code = "000000";
		this.log.log("正在登录");
		await W2Request.login();
		this.log.log("获取心跳");
		await W2Request.loginCheck();
		W2.loginCheck();
		this.log.log("心跳正常, 登录成功");
	}
	// 查询是否是登录状态
	static async isLoginStatus() {
		let result = await W2Request.loginCheck();
		if (result.code === 200) {
			Global.config.w2.token = result.data.token;
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
			Global.config.w2.token = result.data.token;
			Global.config.w2.login_status = W2.status.login_success;
		} else {
			this.log.error("Token失效, 请重新登录");
			Global.config.w2.login_status = W2.status.login_failed;
		}
	}
	bindEvents() {
		this.login_btn.addEventListener("click", async () => {
			await W2.login();
			await W2.currentTask();
		});
		this.relogin_btn.addEventListener("click", async () => {
			 // 再写一个relogin函数
		});
		this.login_out_btn.addEventListener("click", async () => {
			await W2Request.loginOut();
			// 将UI置为默认状态
			this.check_in_out_label.innerText = W2.status.unknown;
			this.meal_working_status_label.innerText = W2.status.unknown;
			this.calendar_label.innerText = W2.status.unknown;
			this.calendar_table.innerHTML = "";

			Global.config.w2.login_status = W2.status.not_login;
			Global.config.w2.token_check_task = false;
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
			await W2.currentTask();
		});
		// 当前任务时间线 -> 停止任务按钮
		this.current_time_line_task_stop_btn.addEventListener("click", async () => {
			await W2.stopAllTask();
		});
		this.prev_month_btn.addEventListener("click", async () => {
			Global.value.month--;
			await this.calendarTask();
		});
		this.next_month_btn.addEventListener("click", async () => {
			Global.value.month++;
			await this.calendarTask();
		});
		// 申请抽调按钮
		this.apply_activity_transfer_btn.addEventListener("click", async () => {
			let typeLabel = this.apply_activity_transfer_type_label.innerText;
			let timeText = this.apply_activity_transfer_time_text.value;
			let momoText = this.apply_activity_transfer_momo_text.value;
			// Global.config.w2.apply_activity_transfer_time = this.apply_activity_transfer_time_text.value;
			// Global.config.w2.apply_activity_transfer_momo = this.apply_activity_transfer_momo_text.value;
			if (!FormatValidation.validateTime(timeText)) {
				DomHelper.bySelectorFromParent(this.error_message_box, "span").innerText = "时间格式错误, 请重新输入";
				this.error_message_box.classList.remove("hidden");
				this.info_message_box.classList.add("hidden");
				this.apply_activity_transfer_time_text.classList.add("border-red-500");
				this.apply_activity_transfer_momo_text.classList.remove("border-red-500");
				return;
			}
			if (!FormatValidation.validateMomo(momoText)) {
				DomHelper.bySelectorFromParent(this.error_message_box, "span").innerText = "备注格式错误, 请重新输入";
				this.error_message_box.classList.remove("hidden");
				this.info_message_box.classList.add("hidden");
				this.apply_activity_transfer_time_text.classList.remove("border-red-500");
				this.apply_activity_transfer_momo_text.classList.add("border-red-500");
				return;
			}
			Global.config.w2.apply_activity_transfer_time = this.apply_activity_transfer_time_text.value;
			Global.config.w2.apply_activity_transfer_momo = this.apply_activity_transfer_momo_text.value;
			let result;
			if (typeLabel === "抽调质检") {
				result = await W2Request.qualityInspection();
			} else if (typeLabel === "线下培训") {
				result = await W2Request.training();
			}
			
			if (FormatValidation.validateMomo(momoText) && FormatValidation.validateTime(timeText) && result.code === 200) {
				DomHelper.bySelectorFromParent(this.info_message_box, "span").innerText = "已发送抽调请求";
				this.error_message_box.classList.add("hidden");
				this.info_message_box.classList.remove("hidden");
				this.apply_activity_transfer_time_text.classList.remove("border-red-500");
				this.apply_activity_transfer_momo_text.classList.remove("border-red-500");
			} else {
				DomHelper.bySelectorFromParent(this.error_message_box, "span").innerText = "错误代码: " + result.code + " " + result.msg;
				this.error_message_box.classList.remove("hidden");
				this.info_message_box.classList.add("hidden");
				this.apply_activity_transfer_time_text.classList.add("border-red-500");
				this.apply_activity_transfer_momo_text.classList.add("border-red-500");
			}
		});
		// 抽调列表
		this.apply_activity_transfer_prev_page_btn.addEventListener("click", async () => {
			Global.value.apply_approval_transfer_list_page--;
			await this.applyActivityTransferList();
		});
		this.apply_activity_transfer_next_page_btn.addEventListener("click", async () => {
			Global.value.apply_approval_transfer_list_page++;
			await this.applyActivityTransferList();
		});
		this.apply_activity_transfer_refresh_page_btn.addEventListener("click", async () => {
			await this.applyActivityTransferList();
		});
	}
	async updateUIElement() {
		this.addTooltipMessage();
		let task = [
			{
				action: async () => {
					this.loginStatusTask();
					
				},
				intervalMs: 3000,
				name: "W2_LOGIN_STATUS_TASK",
			},
			{
				action: async () => {
					this.workingStatusTask();
				},
				intervalMs: 3000,
				name: "W2_WORKING_STATUS_TASK",
			},
			{
				action: async () => {
					this.workHourStatusTask();
				},
				intervalMs: 3000,
				name: "W2_WORK_HOUR_STATUS_TASK",
			},
			{
				action: async () => {
					this.currentTimeLineTask();
				},
				intervalMs: 3000,
				name: "W2_CURRENT_TIME_LINE_TASK",
			},
			{
				action: async () => {
					this.personalStatusTask();
				},
				intervalMs: 3000,
				name: "W2_PERSONAL_STATUS_TASK",
			},
			{
				action: async () => {
					this.calendarTask();
				},
				intervalMs: 1000 * 10,
				name: "W2_CALENDAR_TASK",
			},
			{
				action: async () => {
					this.applyActivityTransferList();
				},
				intervalMs: 1000 * 10,
				name: "W2_APPLY_ACTIVITY_TRANSFER_LIST_TASK",
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
		loginInformat.loginStatus = Global.config.w2.login_status;
		loginInformat.workingStatus = getPersonalInformatResult.data.working_status;
		loginInformat.workHourStatus = getPersonalInformatResult.data.work_hour_status;
		this.log.debug("登录信息: ", loginInformat);
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
		if (Global.config.w2.login_status === W2.status.login_success) {
			Global.config.w2.personal_informat = await W2Request.getPersonalInformat();
		}
	}
	// 更新抽调列表
	async applyActivityTransferList() {
		const apply_activity_transfer_loading = this.apply_activity_transfer_loading;
		let result = await W2Request.getApplyApprovalList();
		if (Global.config.w2.login_status === W2.status.login_success && result.code === 200) {
			if (Global.value.apply_approval_transfer_list_page <= 1) {
				this.apply_activity_transfer_prev_page_btn.disabled = true;
				DomHelper.bySelectorFromParent(this.apply_activity_transfer_prev_page_btn, "i").classList.add('opacity-50');
				DomHelper.bySelectorFromParent(this.apply_activity_transfer_prev_page_btn, "i").classList.add('text-gray-400');
			} else {
				this.apply_activity_transfer_prev_page_btn.disabled = false;
				DomHelper.bySelectorFromParent(this.apply_activity_transfer_prev_page_btn, "i").classList.remove('opacity-50');
				DomHelper.bySelectorFromParent(this.apply_activity_transfer_prev_page_btn, "i").classList.remove('text-gray-400');
			}
			if (Global.value.apply_approval_transfer_list_page >= 3) {
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
		this.login_status_label.innerText = Global.config.w2.login_status || "--";
	}
	// 考勤打卡选项卡的状态显示
	async workingStatusTask() {
		if (Global.config.w2.login_status === W2.status.login_success){
			if (Global.config.w2.personal_informat === null) {
				
			} else if (Global.config.w2.personal_informat.code === 200) {
				// 使用的是 workingStatus 中的键值
				this.check_in_out_label.innerText = W2.workingStatus[Global.config.w2.personal_informat.data.working_status] || W2.status.unknown;
			} else {
				this.check_in_out_label.innerText = W2.status.unknown;
			}
		} else {
			this.check_in_out_label.innerText = W2.status.unknown;
		}
	}
	async workHourStatusTask() {
		if (Global.config.w2.login_status === W2.status.login_success) {
			if (Global.config.w2.personal_informat === null) {

			} else if (Global.config.w2.personal_informat.code === 200) {
				this.meal_working_status_label.innerText = W2.workHourStatus[Global.config.w2.personal_informat.data.work_hour_status] || W2.status.unknown;
			} else {
				this.meal_working_status_label.innerText = W2.status.unknown;
			}
		} else {
			this.meal_working_status_label.innerText = W2.status.unknown;
		}
	}
	// 时间线任务
	async currentTimeLineTask() {
		if (Global.config.w2.login_status === W2.status.login_success) {
			if (TimerScheduler.hasTask(Global.w2_TaskConfig.W2_CHECK_IN_TASK)) {
				this.current_time_line_task_turn_on_off_i.classList.replace("fa-regular", "fa-solid");
			} else {
				this.current_time_line_task_turn_on_off_i.classList.replace("fa-solid", "fa-regular");
			}
			for (let i = 0; i < 4; i++) {
				const icon = this["current_time_line_task_icon_" + i];
				const label = this["current_time_line_task_label_" + i];
				// currentTask的值是currentTaskStatus枚举体中的键值, 由间隔任务currentTask()变更
				if (label.innerText === Global.config.w2.current_time_line_task_status) {
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
		const prevMonth = Global.value.month;
		Global.value.month = Time.getCurrentMonth();

		// 获取当前月份的排班数据
		const scheduleResult = await W2Request.queryPersonalSchedule();

		// 恢复原月份
		Global.value.month = prevMonth;

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
		if (Global.config.w2.login_status === W2.status.login_success && result.code === 200) {
			// 日历标题
			calendar_label.innerText = Time.getCurrentYear() + " 年 " + Global.value.month + " 月";

			// 下个月按钮
			if (Global.value.month >= Time.getCurrentMonth()) {
				this.next_month_btn.classList.add('opacity-50', 'pointer-events-none', 'text-gray-400');
				DomHelper.bySelectorFromParent(this.next_month_btn, "i").classList.add('text-gray-400');
			} else {
				this.next_month_btn.classList.remove('opacity-50', 'pointer-events-none', 'bg-gray-200', 'text-gray-400');
				DomHelper.bySelectorFromParent(this.next_month_btn, "i").classList.remove('text-gray-400', 'pointer-events-none');
			}

			// 上个月按钮
			if (Global.value.month <= 1) {
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
				const current = new Date(Time.getCurrentYear(), Global.value.month - 1, d);
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

				const formattedDate = Time.formatDate(Time.getCurrentYear(), Global.value.month, d);
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
					await W2.loginCheck() 
				},
				intervalMs: 60 * 1000,
				name: "W2_LOGIN_CHECK_TASK"
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
				start: Global.config.w2.time_range_login_start,
				end: Global.config.w2.time_range_login_end,
				action: async () => { 
					await W2.login() 
				},
				name: Global.w2_TaskConfig.W2_LOGIN_TASK
			},
			{
				start: Global.config.w2.time_range_check_in_start,
				end: Global.config.w2.time_range_check_in_end,
				action: async () => { 
					await W2Request.checkIn();
					Global.config.w2.current_time_line_task_status = W2.currentTaskStatus.workIn;
				},
				name: Global.w2_TaskConfig.W2_CHECK_IN_TASK
			},
			{
				start: Global.config.w2.time_range_meal_start,
				end: Global.config.w2.time_range_meal_end,
				action: async () => { 
					await W2Request.meal();
					Global.config.w2.current_time_line_task_status = W2.currentTaskStatus.meal;
				},
				name: Global.w2_TaskConfig.W2_MEAL_TASK
			},
			{
				start: Global.config.w2.time_range_working_start,
				end: Global.config.w2.time_range_working_end,
				action: async () => { 
					await W2Request.working();
					Global.config.w2.current_time_line_task_status = W2.currentTaskStatus.working;
				},
				name: Global.w2_TaskConfig.W2_WORKING_TASK
			},
			{
				start: Global.config.w2.time_range_check_out_start,
				end: Global.config.w2.time_range_check_out_end,
				action: async () => { 
					await W2Request.checkOut();
					Global.config.w2.current_time_line_task_status = W2.currentTaskStatus.workOut;
				},
				name: Global.w2_TaskConfig.W2_CHECK_OUT_TASK
			},
			{
				start: Global.config.w2.time_range_login_out_start,
				end: Global.config.w2.time_range_login_out_end,
				action: async () => { 
					await W2Request.loginOut(); 
				},
				name: Global.w2_TaskConfig.W2_LOGIN_OUT_TASK
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
		Object.values(Global.w2_TaskConfig).forEach(taskName => {
			TimerScheduler.stopTask(taskName);
		});
	}
}
class QLabel extends Page {
	constructor() {
		super();
		this.init();
		// this.bindEvents();
		// this.updateUIElement();
	}
	init() {

	}
	static async testurl() {
		// let url = "https://cn.apihz.cn/api/user/jhdl.php";
		// let header = {
		// 	"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
		// }
		// let data = {
		// 	id: "10008362",
		// 	key: "1d0c8fec499fb7057027e09fc4662fb0",
		// 	type: "2",
		// }
		
		let result = await HttpRequest.fetch({
			url: "https://cn.apihz.cn/api/user/jhdl.php",
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
			},
			data: {
				id: "10008362",
				key: "1d0c8fec499fb7057027e09fc4662fb0",
				type: "2"
			}
		});
		this.log.log(result);
	}
}
class LS extends Page {
	static status = {
		login_success: "登录成功",
		login_failed: "登录失败",
		login_out: "已登出",
		not_loginfill_daily_report: "未打卡",
		already_fill_daily_report: "已打卡",
		failed_fill_daily_report: "打卡失败", // 打卡失败
		unknown: "--"
	};

	constructor() {
		super();
		this.init();
		this.bindEvents();
		this.updateUIElement();
	}
	async init() {
		// 登录状态
		this.login_btn = DomHelper.bySelector("#login_btn"); // 登录按钮
		this.login_out_btn = DomHelper.bySelector("#login_out_btn"); // 登录状态标签
		this.login_status_label = DomHelper.bySelector("#login_status_label"); // 签到签出标签
		// 打卡状态
		this.fill_daily_report_btn = DomHelper.bySelector("#fill_daily_report_btn"); // 打卡按钮
		this.fill_daily_report_label = DomHelper.bySelector("#fill_daily_report_label"); // 打卡状态标签
		// 日报列表
		this.daily_report_list_loading = DomHelper.bySelector("#daily_report_list_loading");
		this.daily_report_list_label = DomHelper.bySelector("#daily_report_list_label"); // 日报列表标题
		this.daily_report_list_table = DomHelper.bySelector("#daily_report_list_table"); // 日报列表表格
	}
	// 登录
	static async login() {
		// 从这里继续, 写ls的登录逻辑
		if (Global.config.ls.user_name == null && Global.config.ls.user_password === null) {
			this.log.error("LS用户名或密码为失效");
			Global.config.ls.login_status = LS.status.login_failed;
			return;
		}
		const result = await LSRequest.login();
		if (result.code === 200) {
			this.log.log("LS登录成功");
			Global.config.ls.login_status = LS.status.login_success;
		} else {
			this.log.error("LS登录失败");
			Global.config.ls.login_status = LS.status.login_failed;
		}
		if (Global.config.ls.sub_task_id === null) {
			let result = await LSRequest.getPersonalInformat();
			if (result.code === 200) {
				this.log.log("获取项目工作区信息成功");
			} else {
				this.log.error("LS -> login() -> 获取项目工作区信息失败");
			}
		}
		if (Global.config.ls.user_id === null || Global.config.ls.task_id === null) {
			let result = await LSRequest.getInfo();
			if (result.code === 200) {
				this.log.log("获取个人信息成功");
			} else {
				this.log.error("LS -> login() -> 获取个人信息失败");
			}
		}
	}
	// 退出登录
	static async loginOut() {
		await LSRequest.loginOut();
		Global.config.ls.login_status = LS.status.login_out;
	}
	// 心跳 如果LS的掉线了再做
	static async loginCheck() {
		
	}
	// 填写日报
	static async fillDailyReport() {
		let result = await LSRequest.fillDailyReport();
		if (result.code === 200) {
			this.log.log("填写日报成功, 返回信息: ", result.msg);
		} else {
			
		}
	}
	// 事件绑定
	bindEvents() {
		this.login_btn.addEventListener("click", async () => {
			await LS.login();
		});
		this.login_out_btn.addEventListener("click", async () => {
			await LS.loginOut();
			Global.config.ls.login_status = LS.status.login_out;
		});
		this.fill_daily_report_btn.addEventListener("click", async () => {
			await LS.fillDailyReport();
		});
	}
	// 刷新UI
	async updateUIElement() {
		// 登录状态UI
		TimerScheduler.setIntervalTask(async () => { this.loginStatus() }, 3000, Global.ls_TaskConfig.LS_LOGIN_STATUS_TASK);
		// 刷新日报列表的任务
		TimerScheduler.setIntervalTask(async () => { this.getDailyReportList() }, 3000, Global.ls_TaskConfig.LS_GET_DAILY_REPORT_LIST_TASK);
		// 打卡任务UI
		TimerScheduler.setIntervalTask(async () => { this.fillDailyReportStatus() }, 3000, Global.ls_TaskConfig.LS_FILL_DAILY_REPORT_STATUS_TASK);
		// 日报列表UI
		TimerScheduler.setIntervalTask(async () => { this.dailyReportList() }, 3000, Global.ls_TaskConfig.LS_DAILY_REPORT_LIST_STATUS_TASK);
	}
	// 登录状态刷新
	async loginStatus() {
		this.login_status_label.innerText = Global.config.ls.login_status;
	}
	async getDailyReportList() {
		let result = await LSRequest.getDailyReportList();
		if (result.code === 200) {
			Global.config.ls.daily_report_list = result;
		} else {
			this.log.error("LS -> getDailyReportList -> 获取日报列表失败");
		}
	}
	// 日报打卡状态
	async fillDailyReportStatus() {
		// 如果检测到当天的记录, 就更新打卡成功
		let result = Global.config.ls.daily_report_list;
		if (result === null) {
			return;
		}
		if (result.code === 200) {
			if (Time.isSameDay(result.rows[0].recordTime, Time.getCurrentDate())) {
				this.fill_daily_report_label.innerText = LS.status.already_fill_daily_report;
			} else {
				this.fill_daily_report_label.innerText = LS.status.not_loginfill_daily_report;
			}
		} else {
			this.fill_daily_report_label.innerText = LS.status.unknown;
		}
	}
	// 日报列表
	async dailyReportList() {
		const daily_report_list_loading = this.daily_report_list_loading;
		let result = Global.config.ls.daily_report_list;
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
	// 清除打卡状态
	async clearDailyReportStatus() {
		Global.config.ls.login_status = LS.status.unknown;
		Global.config.ls.fill_daily_report_status = LS.status.unknown;
	}
	// 定时任务
	static async currentTask() {
		// // 模块时间区间任务设置
		// time_range_login_start: "08:50",
		// time_range_login_end: "08:50",
		// time_range_login_out_start: "18:35", 
		// time_range_login_out_end: "18:35", 
		// time_range_fill_daily_report_start: "17:00",
		// time_range_fill_daily_report_end: "17:00",
		const taskConfigs = [
			{
				start: Global.config.ls.time_range_login_start,
				end: Global.config.ls.time_range_login_end,
				action: async () => { await LS.login() },
				name: Global.ls_TaskConfig.LS_LOGIN_TASK
			},
			{
				start: Global.config.ls.time_range_login_out_start,
				end: Global.config.ls.time_range_login_out_end,
				action: async () => { await LS.loginOut() },
				name: Global.ls_TaskConfig.LS_LOGIN_OUT_TASK
			},
			{
				start: Global.config.ls.time_range_fill_daily_report_start,
				end: Global.config.ls.time_range_fill_daily_report_end,
				action: async () => { await LS.fillDailyReport() },
				name: Global.ls_TaskConfig.LS_FILL_DAILY_REPORT_TASK
			}
		]
		if (!await W2.isTodayOff()) {
			for (const config of taskConfigs) {
				TimerScheduler.setDailyTask(
					Time.getRandomTimeInRange(config.start, config.end),
					config.action,
					config.name
				);
			}
			this.log.log("今天是工作日, 定时任务已启动");
		} else {
			// LS.stopAllTask();
			this.log.log("今天是休息日");
		}
	}
}
class Setting extends Page {
	constructor() {
		super();
		this.init();
		this.bindEvents();
		this.updateUIElement();
	}
	init() {
		// API盒子账号设置
		this.api_box_user_test_account_setting_button = DomHelper.bySelector("#api_box_user_test_account_setting_button"); // API盒子账号测试按钮
		this.api_box_user_id_account_setting_input = DomHelper.bySelector("#api_box_user_id_account_setting_input"); // API盒子通讯ID输入框
		this.api_box_api_key_account_setting_input = DomHelper.bySelector("#api_box_api_key_account_setting_input"); // API盒子通讯密钥输入框
		this.api_box_info_account_setting_message_box = DomHelper.bySelector("#api_box_info_account_setting_message_box"); // API盒子信息框
		this.api_box_error_account_setting_message_box = DomHelper.bySelector("#api_box_error_account_setting_message_box"); // API盒子错误信息框
		// W2账号设置
		this.w2_user_test_account_setting_button = DomHelper.bySelector("#w2_user_test_account_setting_button"); // W2账号测试按钮
		this.w2_user_name_account_setting_input = DomHelper.bySelector("#w2_user_name_account_setting_input"); // W2账号输入框 账号
		this.w2_user_password_account_setting_input = DomHelper.bySelector("#w2_user_password_account_setting_input"); // W2密码输入框
		this.w2_email_api_test_account_setting_button = DomHelper.bySelector("#w2_email_api_test_account_setting_button"); // W2API测试按钮
		this.w2_email_api_address_account_setting_input = DomHelper.bySelector("#w2_email_api_address_account_setting_input"); // W2邮箱输入框
		this.w2_email_api_pop3_auth_code_account_setting_input = DomHelper.bySelector("#w2_email_api_pop3_auth_code_account_setting_input"); // W2POP3授权码输入框
		this.w2_error_account_setting_message_box = DomHelper.bySelector("#w2_error_account_setting_message_box") // W2错误提示
		this.w2_info_account_setting_message_box = DomHelper.bySelector("#w2_info_account_setting_message_box"); // W2提示信息
		// W2模块设置
		this.w2_time_range_validate_format_module_setting_button = DomHelper.bySelector("#w2_time_range_validate_format_module_setting_button"); // W2验证格式按钮
		this.w2_time_range_login_start_module_setting_input = DomHelper.bySelector("#w2_time_range_login_start_module_setting_input"); // W2登录时间段开始输入框
		this.w2_time_range_login_end_module_setting_input = DomHelper.bySelector("#w2_time_range_login_end_module_setting_input"); // W2登录时间段结束输入框
		this.w2_time_range_login_out_start_module_setting_input = DomHelper.bySelector("#w2_time_range_login_out_start_module_setting_input"); // W2登出时间段开始输入框
		this.w2_time_range_login_out_end_module_setting_input = DomHelper.bySelector("#w2_time_range_login_out_end_module_setting_input"); // W2登出时间段结束输入框
		this.w2_time_range_check_in_start_module_setting_input = DomHelper.bySelector("#w2_time_range_check_in_start_module_setting_input"); // W2上班时间段开始输入框
		this.w2_time_range_check_in_end_module_setting_input = DomHelper.bySelector("#w2_time_range_check_in_end_module_setting_input"); // W2上班时间段结束输入框
		this.w2_time_range_check_out_start_module_setting_input = DomHelper.bySelector("#w2_time_range_check_out_start_module_setting_input"); // W2下班时间段开始输入框
		this.w2_time_range_check_out_end_module_setting_input = DomHelper.bySelector("#w2_time_range_check_out_end_module_setting_input"); // W2下班时间段结束输入框
		this.w2_time_range_meal_start_module_setting_input = DomHelper.bySelector("#w2_time_range_meal_start_module_setting_input"); // W2吃饭时间段开始输入框
		this.w2_time_range_meal_end_module_setting_input = DomHelper.bySelector("#w2_time_range_meal_end_module_setting_input"); // W2吃饭时间段结束输入框
		this.w2_time_range_working_start_module_setting_input = DomHelper.bySelector("#w2_time_range_working_start_module_setting_input"); // W2工作时间段开始输入框
		this.w2_time_range_working_end_module_setting_input = DomHelper.bySelector("#w2_time_range_working_end_module_setting_input"); // W2工作时间段结束输入框
		this.w2_info_setting_message_box = DomHelper.bySelector("#w2_info_setting_message_box"); // W2高级设置提示信息
		this.w2_error_setting_message_box = DomHelper.bySelector("#w2_error_setting_message_box"); // W2高级设置错误提示
		// LS账号设置
		this.ls_user_test_account_setting_button = DomHelper.bySelector("#ls_user_test_account_setting_button"); // LS账号测试按钮
		this.ls_user_name_account_setting_input = DomHelper.bySelector("#ls_user_name_account_setting_input"); // LS账号输入框 账号
		this.ls_user_password_account_setting_input = DomHelper.bySelector("#ls_user_password_account_setting_input"); // LS密码输入框
		this.ls_info_account_setting_message_box = DomHelper.bySelector("#ls_info_account_setting_message_box"); // LS提示信息
		this.ls_error_account_setting_message_box = DomHelper.bySelector("#ls_error_account_setting_message_box"); // LS错误提示
		// LS模块设置
		this.ls_time_range_login_start_module_setting_input = DomHelper.bySelector("#ls_time_range_login_start_module_setting_input");
		this.ls_time_range_login_end_module_setting_input = DomHelper.bySelector("#ls_time_range_login_end_module_setting_input");
		this.ls_time_range_login_out_start_module_setting_input = DomHelper.bySelector("#ls_time_range_login_out_start_module_setting_input");
		this.ls_time_range_login_out_end_module_setting_input = DomHelper.bySelector("#ls_time_range_login_out_end_module_setting_input");
		this.ls_time_range_fill_daily_report_start_module_setting_input = DomHelper.bySelector("#ls_time_range_fill_daily_report_start_module_setting_input");
		this.ls_time_range_fill_daily_report_end_module_setting_input = DomHelper.bySelector("#ls_time_range_fill_daily_report_end_module_setting_input");
		this.ls_info_setting_message_box = DomHelper.bySelector("#ls_info_setting_message_box");
		this.ls_error_setting_message_box = DomHelper.bySelector("#ls_error_setting_message_box");
	}
	bindEvents() {
		this.api_box_user_test_account_setting_button.addEventListener("click", async () => {
			Global.config.apibox.user_id = this.api_box_user_id_account_setting_input.value;
			Global.config.apibox.api_key = this.api_box_api_key_account_setting_input.value;
			let result = await ApiboxRequest.getInfo(); // 直接返回状态信息
			this.log.debug("getInfo: ", result);
			if (result.code === 200) {
				this.api_box_info_account_setting_message_box.querySelector("span").innerText = "API账号信息正确";
				this.api_box_error_account_setting_message_box.classList.add('hidden');
				this.api_box_info_account_setting_message_box.classList.remove('hidden');
				this.api_box_user_id_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
				this.api_box_api_key_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
				this.api_box_user_id_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
				this.api_box_api_key_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
			} else {
				this.api_box_error_account_setting_message_box.querySelector("span").innerText = "错误代码: " + result.code + " " + result.msg;
				this.api_box_error_account_setting_message_box.classList.remove('hidden');
				this.api_box_info_account_setting_message_box.classList.add('hidden');
				this.api_box_user_id_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
				this.api_box_api_key_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
				this.api_box_user_id_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
				this.api_box_api_key_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');

				Global.config.apibox.user_id = null;
				Global.config.apibox.api_key = null;
			}
		});
		if (DomHelper.exists(this.w2_user_test_account_setting_button)) {
			this.w2_user_test_account_setting_button.addEventListener("click", async () => {
				Global.config.w2.user_name = this.w2_user_name_account_setting_input.value;
				Global.config.w2.user_password = this.w2_user_password_account_setting_input.value;
				let result = await W2Request.getVerifyCode(); // 直接返回状态信息
				this.log.debug("getVerifyCode: ", result);
				if (result.code === 200) {
					this.w2_info_account_setting_message_box.querySelector("span").innerText = "W2连通性测试无误, 已为邮箱发送验证码";
					this.w2_user_name_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					this.w2_user_password_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					this.w2_info_account_setting_message_box.classList.remove('hidden');
					this.w2_user_name_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					this.w2_user_password_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					this.w2_error_account_setting_message_box.classList.add('hidden');
					Global.config.w2.user_name = this.w2_user_name_account_setting_input.value;
					Global.config.w2.user_password = this.w2_user_password_account_setting_input.value;
				} else if (result === 5000) {
					this.w2_error_account_setting_message_box.querySelector("span").innerText = "W2账号信息错误";
					this.w2_error_account_setting_message_box.classList.remove('hidden');
					this.w2_user_name_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					this.w2_user_password_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					this.w2_user_name_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					this.w2_user_password_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					this.w2_info_account_setting_message_box.classList.add('hidden');
					Global.config.w2.user_name = null;
					Global.config.w2.user_password = null;
				} else {
					this.w2_error_account_setting_message_box.querySelector("span").innerText = "其他未知错误, 请重试";
					this.w2_error_account_setting_message_box.classList.remove('hidden');
					this.w2_user_name_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					this.w2_user_password_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					this.w2_user_name_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					this.w2_user_password_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					this.w2_info_account_setting_message_box.classList.add('hidden');
					Global.config.w2.user_name = null;
					Global.config.w2.user_password = null;
				}
			});
		}
		if (DomHelper.exists(this.w2_email_api_test_account_setting_button)) {
			this.w2_email_api_test_account_setting_button.addEventListener("click", async () => {
				let result;

				Global.config.apibox.user_id = this.api_box_user_id_account_setting_input.value;
				Global.config.apibox.api_key = this.api_box_api_key_account_setting_input.value;

				result = await ApiboxRequest.getInfo(); // 直接返回状态信息
				this.log.debug("getInfo: ", result);
				if (result.code !== 200) {
					this.w2_error_account_setting_message_box.querySelector("span").innerText = "Apibox通讯ID与密钥错误";
					this.w2_error_account_setting_message_box.classList.remove('hidden');
					this.w2_email_api_address_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					this.w2_email_api_pop3_auth_code_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					this.api_box_user_id_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					this.api_box_api_key_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					return;
				}

				Global.config.w2.email_api_address = this.w2_email_api_address_account_setting_input.value;
				Global.config.w2.email_api_pop3_auth_code = this.w2_email_api_pop3_auth_code_account_setting_input.value;
				result = await ApiboxRequest.getEmailApi(); // 返回结果
				if (result.code === 200) {
					this.w2_info_account_setting_message_box.querySelector("span").innerText = "W2邮箱API连通性测试无误, 已获取邮箱列表";
					this.w2_email_api_address_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					this.w2_email_api_pop3_auth_code_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					this.api_box_user_id_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					this.api_box_api_key_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
					
					this.w2_email_api_address_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					this.w2_email_api_pop3_auth_code_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					this.api_box_user_id_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					this.api_box_api_key_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
					
					this.w2_info_account_setting_message_box.classList.remove('hidden');
					this.w2_error_account_setting_message_box.classList.add('hidden');

					Global.config.w2.email_api_address = this.w2_email_api_address_account_setting_input.value;
					Global.config.w2.email_api_pop3_auth_code = this.w2_email_api_pop3_auth_code_account_setting_input.value;
				} else {
					this.w2_error_account_setting_message_box.querySelector("span").innerText = "错误代码: " + result.code + " " + result.msg;

					this.w2_email_api_address_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					this.w2_email_api_pop3_auth_code_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					this.api_box_user_id_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
					this.api_box_api_key_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');

					this.w2_email_api_address_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					this.w2_email_api_pop3_auth_code_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
					this.api_box_user_id_account_setting_input.classList.add('border-red-300', 'focus:ring-red-500');
					this.api_box_api_key_account_setting_input.classList.add('border-red-300', 'focus:ring-red-500');

					this.w2_error_account_setting_message_box.classList.remove('hidden');
					this.w2_info_account_setting_message_box.classList.add('hidden');

					Global.config.w2.email_api_address = null;
					Global.config.w2.email_api_pop3_auth_code = null;
				}
			});
		}
		this.ls_time_range_validate_format_module_setting_button = DomHelper.bySelector("#ls_time_range_validate_format_module_setting_button");
		this.ls_time_range_validate_format_module_setting_button.addEventListener("click", async () => {
			
			// const time_range_login_start = this.ls_time_range_login_start_module_setting_input.value;
			// const time_range_login_end = this.ls_time_range_login_end_module_setting_input.value;
			// const time_range_login_out_start = this.ls_time_range_login_out_start_module_setting_input.value;
			// const time_range_login_out_end = this.ls_time_range_login_out_end_module_setting_input.value;
			// const time_range_fill_daily_report_start = this.ls_time_range_fill_daily_report_start_module_setting_input.value;
			// const time_range_fill_daily_report_end = this.ls_time_range_fill_daily_report_end_module_setting_input.value;
			// 获取所有时间值
			const timeFields = [
				{
					start: this.ls_time_range_login_start_module_setting_input.value,
					end: this.ls_time_range_login_end_module_setting_input.value,
					configStart: 'time_range_login_start',
					configEnd: 'time_range_login_end',
					fieldName: '登录',
					startInput: this.ls_time_range_login_start_module_setting_input,
					endInput: this.ls_time_range_login_end_module_setting_input
				},
				{
					start: this.ls_time_range_login_out_start_module_setting_input.value,
					end: this.ls_time_range_login_out_end_module_setting_input.value,
					configStart: 'time_range_login_out_start',
					configEnd: 'time_range_login_out_end',
					fieldName: '退出登录',
					startInput: this.ls_time_range_login_out_start_module_setting_input,
					endInput: this.ls_time_range_login_out_end_module_setting_input
				},
				{
					start: this.ls_time_range_fill_daily_report_start_module_setting_input.value,
					end: this.ls_time_range_fill_daily_report_end_module_setting_input.value,
					configStart: 'time_range_fill_daily_report_start',
					configEnd: 'time_range_fill_daily_report_end',
					fieldName: '填报日报',
					startInput: this.ls_time_range_fill_daily_report_start_module_setting_input,
					endInput: this.ls_time_range_fill_daily_report_end_module_setting_input
				}
			];
			// 将时间字符串转换为秒数进行比较的函数
			function timeToSeconds(timeStr) {
				const parts = timeStr.split(':');
				if (parts.length !== 3) return 0;
				return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
			}
			// 循环检查所有时间字段
			for (const field of timeFields) {
				if (timeToSeconds(field.start) > timeToSeconds(field.end)) {
					DomHelper.bySelectorFromParent(this.ls_error_setting_message_box, "span").innerText = field.fieldName + " 开始时间不能晚于结束时间";
					this.ls_error_setting_message_box.classList.remove("hidden");
					this.ls_info_setting_message_box.classList.add("hidden");
					field.startInput.classList.add("border-red-500");
					field.endInput.classList.add("border-red-500");
					return;
				} else {
					field.startInput.classList.remove("border-red-500");
					field.endInput.classList.remove("border-red-500");
				}
			}
			// 如果没有错误, 保存配置
			for (const field of timeFields) {
				Global.config.ls[field.configStart] = field.start;
				Global.config.ls[field.configEnd] = field.end;
			}
			DomHelper.bySelectorFromParent(this.ls_info_setting_message_box, "span").innerText = "时间段配置已保存";
			this.ls_info_setting_message_box.classList.remove("hidden");
			this.ls_error_setting_message_box.classList.add("hidden");
		});
		this.w2_time_range_validate_format_module_setting_button.addEventListener("click", async () => {
			// 获取所有时间值
			const timeFields = [
				{
					start: this.w2_time_range_login_start_module_setting_input.value,
					end: this.w2_time_range_login_end_module_setting_input.value,
					configStart: 'time_range_login_start',
					configEnd: 'time_range_login_end',
					fieldName: '登录',
					startInput: this.w2_time_range_login_start_module_setting_input,
					endInput: this.w2_time_range_login_end_module_setting_input
				},
				{
					start: this.w2_time_range_login_out_start_module_setting_input.value,
					end: this.w2_time_range_login_out_end_module_setting_input.value,
					configStart: 'time_range_login_out_start',
					configEnd: 'time_range_login_out_end',
					fieldName: '退出登录',
					startInput: this.w2_time_range_login_out_start_module_setting_input,
					endInput: this.w2_time_range_login_out_end_module_setting_input
				},
				{
					start: this.w2_time_range_check_in_start_module_setting_input.value,
					end: this.w2_time_range_check_in_end_module_setting_input.value,
					configStart: 'time_range_check_in_start',
					configEnd: 'time_range_check_in_end',
					fieldName: '上班打卡',
					startInput: this.w2_time_range_check_in_start_module_setting_input,
					endInput: this.w2_time_range_check_in_end_module_setting_input
				},
				{
					start: this.w2_time_range_check_out_start_module_setting_input.value,
					end: this.w2_time_range_check_out_end_module_setting_input.value,
					configStart: 'time_range_check_out_start',
					configEnd: 'time_range_check_out_end',
					fieldName: '下班打卡',
					startInput: this.w2_time_range_check_out_start_module_setting_input,
					endInput: this.w2_time_range_check_out_end_module_setting_input
				},
				{
					start: this.w2_time_range_meal_start_module_setting_input.value,
					end: this.w2_time_range_meal_end_module_setting_input.value,
					configStart: 'time_range_meal_start',
					configEnd: 'time_range_meal_end',
					fieldName: '前往用餐',
					startInput: this.w2_time_range_meal_start_module_setting_input,
					endInput: this.w2_time_range_meal_end_module_setting_input
				},
				{
					start: this.w2_time_range_working_start_module_setting_input.value,
					end: this.w2_time_range_working_end_module_setting_input.value,
					configStart: 'time_range_working_start',
					configEnd: 'time_range_working_end',
					fieldName: '切换标注',
					startInput: this.w2_time_range_working_start_module_setting_input,
					endInput: this.w2_time_range_working_end_module_setting_input
				}
			];
			
			// 将时间字符串转换为秒数进行比较的函数
			function timeToSeconds(timeStr) {
				const parts = timeStr.split(':');
				if (parts.length !== 3) return 0;
				return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
			}
			
			// 循环检查所有时间字段
			for (const field of timeFields) {
				if (timeToSeconds(field.start) > timeToSeconds(field.end)) {
					DomHelper.bySelectorFromParent(w2_error_setting_message_box, "span").innerText = field.fieldName + " 开始时间不能晚于结束时间";
					this.w2_error_setting_message_box.classList.remove("hidden");
					this.w2_info_setting_message_box.classList.add("hidden");
					field.startInput.classList.add("border-red-500");
					field.endInput.classList.add("border-red-500");
					return;
				} else {
					field.startInput.classList.remove("border-red-500");
					field.endInput.classList.remove("border-red-500");
				}
			}
			
			// 如果没有错误, 保存配置
			for (const field of timeFields) {
				Global.config.w2[field.configStart] = field.start;
				Global.config.w2[field.configEnd] = field.end;
			}
			// w2_info_account_setting_message_box.querySelector("span").innerText = "W2连通性测试无误, 已为邮箱发送验证码";
			DomHelper.bySelectorFromParent(w2_info_setting_message_box, "span").innerText = "时间段配置已保存";
			this.w2_info_setting_message_box.classList.remove("hidden");
			this.w2_error_setting_message_box.classList.add("hidden");
			// 重新开始任务
			await W2.currentTask();
		});
		this.ls_user_test_account_setting_button.addEventListener("click", async () => {
			Global.config.ls.user_name = this.ls_user_name_account_setting_input.value;
			Global.config.ls.user_password = this.ls_user_password_account_setting_input.value;
	
			let result = await LSRequest.login(); // 返回结果
			if (result.code === 200) {
				this.ls_info_account_setting_message_box.querySelector("span").innerText = "LS连通性测试无误";
				this.ls_user_name_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
				this.ls_user_password_account_setting_input.classList.remove('border-red-500', 'focus:ring-red-500');
				
				this.ls_user_name_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
				this.ls_user_password_account_setting_input.classList.add('border-gray-300', 'focus:ring-blue-500');
				

				this.ls_info_account_setting_message_box.classList.remove('hidden');
				this.ls_error_account_setting_message_box.classList.add('hidden');

				Global.config.ls.user_name = this.ls_user_name_account_setting_input.value;
				Global.config.ls.user_password = this.ls_user_password_account_setting_input.value;
			} else {
				this.ls_error_account_setting_message_box.querySelector("span").innerText = "错误代码: " + result.code + " " + result.msg;

				this.ls_user_name_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');
				this.ls_user_password_account_setting_input.classList.remove('border-gray-300', 'focus:ring-blue-500');

				this.ls_user_name_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');
				this.ls_user_password_account_setting_input.classList.add('border-red-500', 'focus:ring-red-500');

				this.ls_error_account_setting_message_box.classList.remove('hidden');
				this.ls_info_account_setting_message_box.classList.add('hidden');

				Global.config.ls.user_name = null;
				Global.config.ls.user_password = null;
			}
		})
	}
	async updateUIElement() {
		if (Global.config.apibox.user_id !== null && Global.config.apibox.api_key !== null) {
			this.api_box_user_id_account_setting_input.value = Global.config.apibox.user_id;
			this.api_box_api_key_account_setting_input.value = Global.config.apibox.api_key;
		}
		if (Global.config.w2.user_name !== null && Global.config.w2.user_password !== null) {
			this.w2_user_name_account_setting_input.value = Global.config.w2.user_name;
			this.w2_user_password_account_setting_input.value = Global.config.w2.user_password;
		}
		if (Global.config.w2.email_api_address !== null && Global.config.w2.email_api_pop3_auth_code !== null) {
			this.w2_email_api_address_account_setting_input.value = Global.config.w2.email_api_address;
			this.w2_email_api_pop3_auth_code_account_setting_input.value = Global.config.w2.email_api_pop3_auth_code;
		}
		if (Global.config.w2.time_range_login_start !== null && Global.config.w2.time_range_login_end !== null) {
			this.w2_time_range_login_start_module_setting_input.value = Global.config.w2.time_range_login_start;
			this.w2_time_range_login_end_module_setting_input.value = Global.config.w2.time_range_login_end;
		}
		if (Global.config.w2.time_range_login_out_start !== null && Global.config.w2.time_range_login_out_end !== null) {
			this.w2_time_range_login_out_start_module_setting_input.value = Global.config.w2.time_range_login_out_start;
			this.w2_time_range_login_out_end_module_setting_input.value = Global.config.w2.time_range_login_out_end;
		}
		if (Global.config.w2.time_range_check_in_start !== null && Global.config.w2.time_range_check_in_end !== null) {
			this.w2_time_range_check_in_start_module_setting_input.value = Global.config.w2.time_range_check_in_start;
			this.w2_time_range_check_in_end_module_setting_input.value = Global.config.w2.time_range_check_in_end;
		}
		if (Global.config.w2.time_range_check_out_start !== null && Global.config.w2.time_range_check_out_end !== null) {
			this.w2_time_range_check_out_start_module_setting_input.value = Global.config.w2.time_range_check_out_start;
			this.w2_time_range_check_out_end_module_setting_input.value = Global.config.w2.time_range_check_out_end;
		} 
		if (Global.config.w2.time_range_meal_start !== null && Global.config.w2.time_range_meal_end !== null) {
			this.w2_time_range_meal_start_module_setting_input.value = Global.config.w2.time_range_meal_start;
			this.w2_time_range_meal_end_module_setting_input.value = Global.config.w2.time_range_meal_end;
		}
		if (Global.config.w2.time_range_working_start !== null && Global.config.w2.time_range_working_end !== null) {
			this.w2_time_range_working_start_module_setting_input.value = Global.config.w2.time_range_working_start;
			this.w2_time_range_working_end_module_setting_input.value = Global.config.w2.time_range_working_end;
		}
		if (Global.config.ls.user_name !== null && Global.config.ls.user_password !== null) {
			this.ls_user_name_account_setting_input.value = Global.config.ls.user_name;
			this.ls_user_password_account_setting_input.value = Global.config.ls.user_password;
		}
		if (Global.config.ls.time_range_login_start !== null && Global.config.ls.time_range_login_end !== null) {
			this.ls_time_range_login_start_module_setting_input.value = Global.config.ls.time_range_login_start;
			this.ls_time_range_login_end_module_setting_input.value = Global.config.ls.time_range_login_end;
		}
		if (Global.config.ls.time_range_login_out_start !== null && Global.config.ls.time_range_login_out_end !== null) {
			this.ls_time_range_login_out_start_module_setting_input.value = Global.config.ls.time_range_login_out_start;
			this.ls_time_range_login_out_end_module_setting_input.value = Global.config.ls.time_range_login_out_end;
		}
		if (Global.config.ls.time_range_fill_daily_report_start !== null && Global.config.ls.time_range_fill_daily_report_end !== null) {
			this.ls_time_range_fill_daily_report_start_module_setting_input.value = Global.config.ls.time_range_fill_daily_report_start;
			this.ls_time_range_fill_daily_report_end_module_setting_input.value = Global.config.ls.time_range_fill_daily_report_end;
		}
	}
}
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
	}
	static updateUIElement() {
		this.avatarImg();
		// this.getNotice();
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
				intervalMs: 1000 * 3,
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
		this.user_avatar = DomHelper.bySelector("#user_avatar");
		// 消息中心
		this.notice_btn = DomHelper.bySelector("#notice_btn");
		this.notice_i = DomHelper.bySelector("#notice_i");
		this.notice_panel_div = DomHelper.bySelector("#notice_panel_div");
		this.notice_list_div = DomHelper.bySelector("#notice_list_div");
		this.notice_div = DomHelper.bySelector("#notice_div");
		this.notice_label = DomHelper.bySelector("#notice_label");
		this.notice_time_label = DomHelper.bySelector("#notice_time_label");
		this.notice_close = DomHelper.bySelector("#notice_close");

		// 底部导航栏
		// 模块状态
		this.model_status = DomHelper.bySelector("#model_status");
		this.model_status_w2_i = DomHelper.bySelector("#model_status_w2_i");
		this.model_status_w2_loading = DomHelper.bySelector("#model_status_w2_loading");
		this.model_status_w2_label = DomHelper.bySelector("#model_status_w2_label");
		this.model_status_ls_i = DomHelper.bySelector("#model_status_ls_i");
		this.model_status_ls_loading = DomHelper.bySelector("#model_status_ls_loading");
		this.model_status_ls_label = DomHelper.bySelector("#model_status_ls_label");
		// 天气状态
		this.weather_message_box = DomHelper.bySelector("#weather_message_box");
		this.weather_div = DomHelper.bySelector("#weather_div");
		this.weather_icon = DomHelper.bySelector("#weather_icon");
		this.weather_temp_label = DomHelper.bySelector("#weather_temp_label");
		this.weather_city_label = DomHelper.bySelector("#weather_city_label");
		this.weather_wind_label = DomHelper.bySelector("#weather_wind_label");
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
		// 从这里继续
		const notice_btn = this.notice_btn;
		const notice_i = this.notice_i;
		const notice_div = this.notice_div;
		const notice_label = this.notice_label;
		const notice_time_label = this.notice_time_label;
		let result = await JsonBinRequest.getNotice();
		// result.record.notice
		notice_label.innerText = Global.config.cache.notice;
		if (Global.config.cache.notice !== result.record.notice) {
			notice_label.innerText = result.record.notice;
			notice_i.classList.remove("fa-bell");
			notice_i.classList.add("fa-bell-ring");
			notice_i.classList.add("fa-shake");
			notice_div.classList.remove("hidden");
		} else {

		}
		notice_div.addEventListener("click", () => {
			notice_i.classList.remove("fa-shake");
			notice_i.classList.remove("fa-bell-ring");
			notice_i.classList.add("fa-bell");			
			Global.config.cache.notice = result.record.notice;
		});
	}
	static async modelStatus() {
		const model_status_w2_i = this.model_status_w2_i;
		const model_status_w2_loading = this.model_status_w2_loading;
		const model_status_w2_label = this.model_status_w2_label;
		const model_status_ls_i = this.model_status_ls_i;
		const model_status_ls_loading = this.model_status_ls_loading;
		const model_status_ls_label = this.model_status_ls_label;
		if (Global.config.w2.login_status === W2.status.login_success) {
			model_status_w2_label.innerText = Global.config.w2.current_time_line_task_status;
			model_status_w2_i.classList.replace("text-gray-500", "text-green-500");
			model_status_w2_loading.classList.add("hidden");
			model_status_w2_label.classList.remove("hidden");
		} else {
			model_status_w2_i.classList.replace("text-green-500", "text-gray-500");
			model_status_w2_loading.classList.remove("hidden");
			model_status_w2_label.classList.add("hidden");
		}
		// 待优化, 将日报是否填写不再由updateUIElement来判断, 而由Template模块来判断
		if (Global.config.ls.login_status === LS.status.login_success) {
			let result = await LSRequest.getDailyReportList();
			Global.config.ls.daily_report_list = result;
			if (Time.isSameDay(result.rows[0].recordTime, Time.getCurrentDate())) {
				model_status_ls_label.innerText = LS.status.already_fill_daily_report;
				model_status_ls_i.classList.replace("text-gray-500", "text-green-500");
				model_status_ls_loading.classList.add("hidden");
				model_status_ls_label.classList.remove("hidden");
			} else {
				model_status_ls_label.innerText = LS.status.not_loginfill_daily_report;
			}
		} else {
			model_status_ls_i.classList.replace("text-green-500", "text-gray-500");
			model_status_ls_loading.classList.remove("hidden");
			model_status_ls_label.classList.add("hidden");
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
		img.src = Global.config.login.user_avatar_url;
		img.className = "w-7 h-7 rounded-full object-cover";

		// 清空原有内容
		avatarBtn.innerHTML = "";

		// 插入头像
		avatarBtn.appendChild(img);
	}
}