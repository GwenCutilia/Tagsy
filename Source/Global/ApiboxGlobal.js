class ApiboxGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "ApiboxGlobal.cache");
	}
	static cache = {
		information: {
			id: null,
			key: null,
		}
	}
}