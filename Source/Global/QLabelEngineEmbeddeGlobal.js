class QLabelEngineEmbeddeGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "QLabelEngineEmbeddeGlobal.cache");
		this.setting = await super.initObject(this.setting, "QLabelEngineEmbeddeGlobal.setting");
	}
	static cache = {

	}
	static setting = {

	}
	static domMap = {
		// 拉框
		boundingBox: {
			
		}
	}
}