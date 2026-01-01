class QLabelEngineGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "QLabelEngineGlobal.cache");
		this.setting = await super.initObject(this.setting, "QLabelEngineGlobal.setting");
	}
	// 缓存
	static cache = {
		api: {
			listLabelTasks: {
				start: 0, // 从第几题开始查询
			},
		},
		cookie: {
			task: {
				taskId: null,
				packKey: null,
				taskName: null,
				detailId: null,
			},
			pack: {
				detailLabel: {
					"tags": [
						{
							"name": "imgMask",
							"label":"imgMask"
						}
					],
					"extData":null,
					"objects":[]
				},
			},
			local: {
				session: null,
				sessionId: null, // 以后需要改一下所属的类
				route: null,
			}
		},
		resultData: [
			{

			}
		],
	}
	static setting = {
		embeddeModule: {
			TurnOnOrOff: false, // 企鹅引擎内嵌功能是否启用
		}
	}
	static domMap = {

	}
}