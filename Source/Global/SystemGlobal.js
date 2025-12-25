class SystemGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "SystemGlobal.cache");
	}
	static cache = {
		// 开发者模式
		developer: {
			mode: false,
		}
	}
	static status = {
		load: false,
	}
}