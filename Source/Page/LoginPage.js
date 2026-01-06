class LoginWeb extends Framework {
	constructor() {
		super();
	}
	async init() {
		// await super.init();
		await this.initValue();
		await this.bindEvents();
		await this.addAanimationEffect();
	}
	async initValue() {
		await LoginGlobal.init();
		Behavior.initContext(this);
		// 初始化Behavior
		Behavior.initDomMap(LoginGlobal.domMap);
	}
	async bindEvents() {
		LoginBehaviorBindEvents.togglePasswordMask();
		LoginBehaviorBindEvents.loginUserName();
		LoginBehaviorBindEvents.regAccountForBtn();
		LoginBehaviorBindEvents.regAccountForQrBtn();
	}
	async addAanimationEffect() {
		LoginAddAanimationEffect.addParticleEffects();
	}
}