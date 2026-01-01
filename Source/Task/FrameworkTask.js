class FrameworkTask {
	static async initValue() {
		await FrameworkGlobal.init();
		await LoginGlobal.init();
		await W2Global.init();
		await QLabelGlobal.init();
		await TLabelGlobal.init();
		await LSGlobal.init();
		await ApiboxGlobal.init();
		await SystemGlobal.init();
		await QLabelEngineGlobal.init();
	}
	static async initQLabelValue() {
		await QLabelEngineGlobal.init();
		await TLabelGlobal.init();
		await SystemGlobal.init();
	}
	// 初始化任务
	static async loadTask() {
		await this.W2Task();
		await this.LSTask();
		await this.TLTask();
	}
	
	// W2任务
	static async W2Task() {
		await W2BehaviorTask.loginProcess();
		await W2BehaviorTask.intervalTask();
		await W2BehaviorTask.currentTask();
	}

	// LS任务
	static async LSTask() {
		await LSBehaviorTask.loginProcess();
		await LSBehaviorTask.currentTask();
	}

	// TL任务
	static async TLTask() {
		// await TLabelBehaviorTask.loginProcess();
		await TLabelBehaviorTask.currentTask();
	}
}