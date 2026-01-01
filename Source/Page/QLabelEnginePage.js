class QLabelEngine extends Framework {

}
class QLabelEmbeddeEngine {
	async init() {
		this.log = new Logger("QLabelEmbeddeEngine");
		this.log.log("QLabelEmbeddeEngine 逻辑已加载");
		await this.initValue();
		await this.initTask();
	}
	async initValue() {
		Behavior.initContext(this);
		Behavior.initDomMap(QLabelEngineEmbeddeGlobal.domMap);
		await QLabelEngineGlobal.init();
		await QLabelEngineEmbeddeGlobal.init();
	}
	async initTask() {
		// 获取登录状态Cookie
		// await QLabelEngineEmbeddeBehaviorHelperUtils.QLabelCookieInit();
		await QLabelEngineEmbeddeBehaviorHelperUtils.TLabelCookieInit();
		if (QLabelEngineGlobal.setting.embeddeModule.TurnOnOrOff === true) {
			this.log.log("运行 QLabelEmbeddeEngine 逻辑");
		}
	}
}
// class TLabelEmbeddeEngine {
// 	async init() {
// 		this.log = new Logger("TLabelEmbeddeEngine");
// 		this.log.log("TLabelEmbeddeEngine 逻辑已加载");
// 		await this.initValue();
// 		await this.initTask();
// 	}
// 	async initValue() {
// 		Behavior.initContext(this);
// 		Behavior.initDomMap(TLabelEngineEmbeddeGlobal.domMap);
// 		await TLabelEngineGlobal.init();
// 		await TLabelEngineEmbeddeGlobal.init();
// 	}
// 	async initTask() {
// 		// 获取登录状态Cookie
// 		await TLabelEngineEmbeddeBehaviorHelperUtils.QLabelCookieInit();
// 		if (TLabelEngineGlobal.setting.embeddeModule.TurnOnOrOff === true) {
// 			this.log.log("运行 TLabelEmbeddeEngine 逻辑");
// 		}
// 	}
// }