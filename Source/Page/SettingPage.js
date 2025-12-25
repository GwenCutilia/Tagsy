class SettingWeb extends Framework {
	constructor() {
		super();
	}
	async init() {
		await super.init();
		await this.initValue();
		await this.bindEvents();
		await this.initTask();
		await this.updateUIElement();
	}
	async initValue() {
		Behavior.initDomMap(SettingGlobal.domMap);
	}
	async initTask() {
		await SettingBehaviorUpdateUIElement.updateTextArea();
		await FrameworkAddAuxiliaryLogic.AllLoadedUIElement();
	}
	async bindEvents() {
		SettingBehaviorBindEvent.initApiboxAccountTest();
		SettingBehaviorBindEvent.initW2AccountTest();
		SettingBehaviorBindEvent.initW2EmailApiTest();
		SettingBehaviorBindEvent.initW2TimeRangeSetting();
		SettingBehaviorBindEvent.initLSAccountTest();
		SettingBehaviorBindEvent.initLSTimeRangeSetting();
		SettingBehaviorBindEvent.initQLabelEmbeddeModuleTurnOnOrOff();
	}
	async updateUIElement() {
		// await SettingBehaviorUpdateUIElement.updateTextArea();
	}
}