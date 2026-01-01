class TLabelBehavior extends Behavior {
	static __autoRegister = Behavior._register(this);
}
// 添加动画效果
class TLabelBehaviorAddAanimationEffect extends TLabelBehavior {

}
// 全局任务
class TLabelBehaviorTask extends TLabelBehavior {
	// 登录流程
	static async loginProcess() {
		await TLabelRequest.checkLogin();
		await TLabelRequest.sendLocalServer();
		await TLabelRequest.verifyLogin();
		await TLabelRequest.openCallbackPage();
	}
	// 定时任务
	static async currentTask() {
		const task = [
			{
				// 登录
				start: TLabelGlobal.setting.currentTask.time_range_login_process_start,
				end: TLabelGlobal.setting.currentTask.time_range_login_process_end,
				action: async () => {
					await TLabelBehaviorTask.loginProcess();
				},
				name: TLabelGlobal.task.dailyTask.loginProcess,
			},
			{
				// 签到
				start: TLabelGlobal.setting.currentTask.time_range_check_in_start,
				end: TLabelGlobal.setting.currentTask.time_range_check_in_end,
				action: async () => {
					await TLabelRequest.checkIn();
				},
				name: TLabelGlobal.task.dailyTask.checkIn,
			},
			{
				// 将个人状态切换到前往用餐
				start: TLabelGlobal.setting.currentTask.time_range_meal_start,
				end: TLabelGlobal.setting.currentTask.time_range_meal_end,
				action: async () => {
					await TLabelRequest.meal();
				},
				name: TLabelGlobal.task.dailyTask.meal,
			},
			{
				// 将个人状态切换到工作中
				start: TLabelGlobal.setting.currentTask.time_range_work_start,
				end: TLabelGlobal.setting.currentTask.time_range_work_start,
				action: async () => {
					await TLabelRequest.work();
				},
				name: TLabelGlobal.task.dailyTask.work,
			},
			{
				// 签退
				start: TLabelGlobal.setting.currentTask.time_range_check_out_start,
				end: TLabelGlobal.setting.currentTask.time_range_check_out_end,
				action: async () => {
					await TLabelRequest.checkOut();
				},
				name: TLabelGlobal.task.dailyTask.checkOut,
			},
			{
				// 登出
				start: TLabelGlobal.setting.currentTask.time_range_log_out_start,
				end: TLabelGlobal.setting.currentTask.time_range_log_out_end,
				action: async () => {
					await TLabelRequest.logOut();
				},
				name: TLabelGlobal.task.dailyTask.logOut,
			}
		]
		// 添加一个能识别是否是工作日的逻辑, 如果是工作日就执行定时任务, 否则就不执行
		for (const config of task) {
			TimerScheduler.setDailyTask(
				Time.getRandomTimeInRange(config.start, config.end),
				config.action,
				config.name
			);
		}
		this.log.log("TL定时任务已启动");
	}
}