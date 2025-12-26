class SystemGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "SystemGlobal.cache");
	}
	static cache = {
		// 开发者模式
		developer: {
			mode: false,
		},
		guide: {
			isFirstRun: true,
		}
	}
	static status = {
		load: false,
	}
}