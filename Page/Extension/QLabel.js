class QLabelWork extends QLabel {
	constructor() {
		super();
	}
	init() {
		this.log.log("QLabelWork 逻辑已加载");

	}
	static async QLabelCookieInit() {
		await getLocalCookie();
	}
	static async updateDetailLabel() {
		await QLabelWorkRequest.updateDetailLabel();
	}
	// const taskId = QLabelWorkGlobal.cache.cookie.task.taskId;
	// const packkey = QLabelWorkGlobal.cache.cookie.task.packKey;
	static collectTooltipObjects() {
		const nodes = document.querySelectorAll(".info-tooltip-content");
		const objects = [];

		nodes.forEach(node => {
			const text = node.textContent?.trim();
			if (!text) {
				return;
			}

			try {
				const obj = JSON.parse(text);

				// 只保留 saveLabel 需要的字段
				objects.push({
					type: obj.type,
					data: obj.data,
					tags: obj.tags,
					featureId: obj.featureId,
					color: obj.color,
					name: obj.name,
					label: obj.label,
					group: obj.group || ""
				});
			} catch (e) {
				console.error("JSON parse failed:", e, text);
			}
		});

		return objects;
	}
	// 获取当前页面的 DetailLabel
	static getDetailLabelCurrentPage() {
		const tooltips = document.querySelectorAll('.info-tooltip-content');

		const currentDetailLabel = {
			"tags": [
				{
					"name": "imgMask",
					"label": "imgMask"
				}
			],
			"extData": {
				"drawnObjects": []
			},
			"objects": []
		};

		tooltips.forEach(el => {
			try {
				const text = el.textContent.trim();
				if (!text) return;

				const obj = JSON.parse(text);

				// tags.value: 解析 -> 使用 -> 再 stringify 回字符串
				if (obj.tags && Array.isArray(obj.tags)) {
					obj.tags = obj.tags.map(tag => {
						if (typeof tag.value === "string") {
							try {
								const parsed = JSON.parse(tag.value);
								// 确保最终写回的是字符串
								tag.value = JSON.stringify(parsed);
							} catch (e) {
								// 非 JSON 字符串，原样保留
							}
						}
						return tag;
					});
				}

				currentDetailLabel.objects.push(obj);
			} catch (e) {
				console.warn("解析失败:", el, e);
			}
		});

		// 使用 Proxy 内部更新方式
		const target = QLabelWorkGlobal.cache.cookie.pack.detailLabel;
		for (const key in currentDetailLabel) {
			target[key] = currentDetailLabel[key];
		}

		this.log.log("currentDetailLabel:", currentDetailLabel);
		this.log.debug(
			"QLabelWorkGlobal.cache.cookie.pack.detailLabel:",
			QLabelWorkGlobal.cache.cookie.pack.detailLabel
		);
	}
}
class QLabelWorkApi extends HttpRequest {
	static log = new Logger("QLabelWorkApi");
	constructor() {
		super();
	}
	// 获取所有标注任务列表 API
	static async listLabelTasks() {
		const session = QLabelWorkGlobal.cache.cookie.local.session;
		const route = QLabelWorkGlobal.cache.cookie.local.route;
		const start = QLabelWorkGlobal.cache.api.listLabelTasks.start;

		const url = "https://qlabel.tencent.com/api/workbench/listLabelTasks";

		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			"sw8": "1-ZjE3NGEzMTMtN2EwYS00MzE5LTgxNDEtNWQ3NjRkNDM4YmZk-YmZkODkxZDYtOTg5OC00OWFhLWExMzUtYTFlNzkyNTdlNTk1-1-YWVnaXM=-MS40My43-L3dvcmtiZW5jaC93b3JrLXRpbWU=-cWxhYmVsLnRlbmNlbnQuY29t",
			"Cookie": "SESSION=" + 
				session +
				"; tgw_l7_route=" + 
				route
		};

		const data = {
			"jsonrpc": "2.0",
			"method": "listLabelTasks",
			"id": 1765531865477,
			"params": {
				"page": {
					"start": start,
					"size": 10,
					"return_total": 1
				},
				"sort": [
					[
						"a.created_at",
						"desc"
					]
				]
			}
		};

		this.log.log("getListLabelTasks data", data);
		const result = await this._request("POST", url, headers, data);

		this.log.log("getListLabelTasks result: ", result);

		return result;
	}
	// 获取当前标注题目信息 API
	static async taskInfo() {
		const session = QLabelWorkGlobal.cache.cookie.local.session;
		const route = QLabelWorkGlobal.cache.cookie.local.route;
		const taskId = QLabelWorkGlobal.cache.cookie.task.taskId;
		const url = "https://qlabel.tencent.com/api/workbench/getTask";

		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			"sw8": "1-ZjE3NGEzMTMtN2EwYS00MzE5LTgxNDEtNWQ3NjRkNDM4YmZk-YmZkODkxZDYtOTg5OC00OWFhLWExMzUtYTFlNzkyNTdlNTk1-1-YWVnaXM=-MS40My43-L3dvcmtiZW5jaC93b3JrLXRpbWU=-cWxhYmVsLnRlbmNlbnQuY29t",
			"Cookie": "SESSION=" + session + "; tgw_l7_route=" + route
		};

		const data = {
			"jsonrpc": "2.0",
			"method": "getTask",
			"id": 1765531335019,
			"params": {
				"task_id": taskId,
				"need_stat_task": true
			}
		};
		this.log.log("taskInfo data", data);

		const result = await this._request("POST", url, headers, data);

		this.log.log("taskInfo result: ", result);

		return result;
	}
	// 通过当前任务ID获取当前题包key API
	static async queueLabel() {
		const session = QLabelWorkGlobal.cache.cookie.local.session;
		const route = QLabelWorkGlobal.cache.cookie.local.route;
		const taskId = QLabelWorkGlobal.cache.cookie.task.taskId;


		const url = "https://qlabel.tencent.com/api/workbench/queueLabel";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			"sw8": "1-ZjE3NGEzMTMtN2EwYS00MzE5LTgxNDEtNWQ3NjRkNDM4YmZk-YmZkODkxZDYtOTg5OC00OWFhLWExMzUtYTFlNzkyNTdlNTk1-1-YWVnaXM=-MS40My43-L3dvcmtiZW5jaC93b3JrLXRpbWU=-cWxhYmVsLnRlbmNlbnQuY29t",
			"Cookie": "SESSION=" + session + "; tgw_l7_route=" + route
		};
		const data = {
			"jsonrpc": "2.0",
			"method": "queueLabel",
			"id": 1765591218668,
			"params": {
				"task_id": taskId,
				"apply_num": 1
			}
		};
		this.log.log("queueLabel data", data);
		const result = await this._request("POST", url, headers, data);
		this.log.log("queueLabel result: ", result);
		return result;
	}
	// 获取当前题包信息
	static async listMyLabelDetail() {
		const session = QLabelWorkGlobal.cache.cookie.local.session;
		const route = QLabelWorkGlobal.cache.cookie.local.route;
		const taskId = QLabelWorkGlobal.cache.cookie.task.taskId;

		const url = "https://qlabel.tencent.com/api/workbench/listMyLabelDetail";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			"sw8": "1-ZjE3NGEzMTMtN2EwYS00MzE5LTgxNDEtNWQ3NjRkNDM4YmZk-YmZkODkxZDYtOTg5OC00OWFhLWExMzUtYTFlNzkyNTdlNTk1-1-YWVnaXM=-MS40My43-L3dvcmtiZW5jaC93b3JrLXRpbWU=-cWxhYmVsLnRlbmNlbnQuY29t",
			"Cookie": "SESSION=" + session + "; tgw_l7_route=" + route
		};
		const data = {
			"jsonrpc": "2.0",
			"method": "listMyLabelDetail",
			"id": 1765620593053,
			"params": {
				"task_id": "1191472240708845568",
				"page": {
					"start": 0,
					"size": 10,
					"return_total": 1
				},
				"status": [
					20,
					25
				]
			}
		};

		this.log.log("listMyLabelDetail data", data);

		const result = await this._request("POST", url, headers, data);

		this.log.log("listMyLabelDetail result: ", result);
		
		return result;
	}
	// 
	static async listMyDetail() {
		const session = QLabelWorkGlobal.cache.cookie.local.session;
		const route = QLabelWorkGlobal.cache.cookie.local.route;
		const taskId = QLabelWorkGlobal.cache.cookie.task.taskId;
		const packkey = QLabelWorkGlobal.cache.cookie.task.packKey;

		const url = "https://qlabel.tencent.com/api/workbench/listMyDetail";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			"sw8": "1-ZjE3NGEzMTMtN2EwYS00MzE5LTgxNDEtNWQ3NjRkNDM4YmZk-YmZkODkxZDYtOTg5OC00OWFhLWExMzUtYTFlNzkyNTdlNTk1-1-YWVnaXM=-MS40My43-L3dvcmtiZW5jaC93b3JrLXRpbWU=-cWxhYmVsLnRlbmNlbnQuY29t",
			"Cookie": "SESSION=" + session + "; tgw_l7_route=" + route
		};
		const data = {
			"jsonrpc": "2.0",
			"method": "listMyDetail",
			"id": 1765529342497,
			"params": {
				"task_id": taskId,
				"pack_keys": [
					packkey
				],
				"need_check_info": 1,
				"cycle_step": 0,
				"need_deliver_info": true,
				"need_template_info": 0,
				"source": 7
			}
		};

		this.log.log("listMyDetail data", data);
		const result = await this._request("POST", url, headers, data);

		this.log.log("listMyDetail result: ", result);
		
		return result;
	}
	// 保存标注结果 API
	static async saveLabel() {
		const session = QLabelWorkGlobal.cache.cookie.local.session;
		const route = QLabelWorkGlobal.cache.cookie.local.route;
		const taskId = QLabelWorkGlobal.cache.cookie.task.taskId;
		const detailId = QLabelWorkGlobal.cache.cookie.task.detailId;
		// const packkey = QLabelWorkGlobal.cache.cookie.task.packKey;

		const url = "https://qlabel.tencent.com/api/workbench/saveLabel";
		const headers = {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			"sw8": "1-ZjE3NGEzMTMtN2EwYS00MzE5LTgxNDEtNWQ3NjRkNDM4YmZk-YmZkODkxZDYtOTg5OC00OWFhLWExMzUtYTFlNzkyNTdlNTk1-1-YWVnaXM=-MS40My43-L3dvcmtiZW5jaC93b3JrLXRpbWU=-cWxhYmVsLnRlbmNlbnQuY29t",
			"Cookie": "SESSION=" + session + "; tgw_l7_route=" + route
		};
		// QLabelWorkGlobal.cache.cookie.pack.savaDetailLabel = {
		// 	"tags": [{
		// 		"name":"imgMask","label":"imgMask"
		// 	}],
		// 	"extData":{
		// 		"drawnObjects":[]
		// 	},
		// 	"objects":[{
		// 		"type": "image/rect",
		// 		"data": [
		// 			{
		// 				"x":1374.63,"y":373.23
		// 			},
		// 			{
		// 				"x":1571.98,"y":373.23
		// 			},
		// 			{
		// 				"x":1571.98,"y":453.21
		// 			},
		// 			{
		// 				"x":1374.63,"y":453.21
		// 			}
		// 		],
		// 		"tags": [
		// 			{
		// 				"name": "input_1763695207054",
		// 				"label":"操作类型&描述",
		// 				"value": {
		// 					"class_id": 0,
		// 					"description": "用于输入用户名的文本框"
		// 				}
		// 			}
		// 		],
		// 		"featureId": "feature-08VUjqDC",
		// 		"color":"#8BC34A",
		// 		"name":"image/rect_1644927786890",
		// 		"label":"方框",
		// 		"group":""
		// 	},
		// 	{
		// 		"type":"image/rect",
		// 		"data":[
		// 			{
		// 				"x":782.59,
		// 				"y":429.39
		// 			},
		// 			{
		// 				"x":1177.29,
		// 				"y":429.39
		// 			},
		// 			{
		// 				"x":1177.29,
		// 				"y":609.77
		// 			},
		// 			{
		// 				"x":782.59,
		// 				"y":609.77
		// 			}
		// 		],
		// 		"tags":[
		// 			{
		// 				"name":"input_1763695207054",
		// 				"label":"操作类型&描述",
		// 				"value":{
		// 					"class_id": 0,
		// 					"description": "用于输入用户名的文本框"
		// 				}
		// 			}
		// 		],
		// 		"featureId":"feature-eLCyVoqX",
		// 		"color":"#8BC34A",
		// 		"name":"image/rect_1644927786890",
		// 		"label":"方框",
		// 		"group":""
		// 	}
		// ]}
		const data = {
			"jsonrpc": "2.0",
			"method": "saveLabel",
			"id": 1765531991826,
			"params": {
				"list": [
					{
						"detail_id": detailId,
						"detail_label": JSON.stringify(QLabelWorkGlobal.cache.cookie.pack.detailLabel),
						"detail_is_valid": 1
					},
				],
				"task_id": taskId,
				"auto": false
			}
		};
		this.log.log("saveLabel data", data);
		const result = await this._request("POST", url, headers, data);

		this.log.log("saveLabel result: ", result);
		
		return result;
	}
	static async _request(method, url, headers, data) {
		return await HttpRequest.fetch({
			method,
			url,
			headers,
			data,
			responseType: "json",
		});
	}
}
class QLabelWorkRequest extends Page {
	// ***************************
	// * 
	// * QLabelWorkRequest
	// * 
	// ***************************
	constructor() {
		super();
	}
	// 获取Cookie
	static async getLocalCookie() {
		GM.CookieList({}, list => {
			const session = list.find(c => c.name === "SESSION");
			QLabelWorkGlobal.cache.cookie.local.session = session.value;
			this.log.log("SESSION:", session?.value);
		});

		GM.CookieList({}, list => {
			const route = list.find(c => c.name === "tgw_l7_route");
			QLabelWorkGlobal.cache.cookie.local.route = route.value;
			this.log.log("tgw_l7_route:", route?.value);
		});

	}
	// 通过任务名称获取任务ID
	static async getTaskIdByName() {
		QLabelWorkGlobal.cache.cookie.task.taskName = "图+视频生文-SFT-GUI-屏幕可交互组件-检测模型1126_macapp-凌波微步-251127";
		QLabelWorkGlobal.cache.cookie.task.taskId = null;
		QLabelWorkGlobal.cache.api.listLabelTasks.start = 0;

		let targetName = QLabelWorkGlobal.cache.cookie.task.taskName;
		let targetTaskId = QLabelWorkGlobal.cache.cookie.task.taskId;
		let start = QLabelWorkGlobal.cache.api.listLabelTasks.start;
		let total = 0;
		let saveTaskId = null;
		do {
			this.log.debug("当前 start:", start);
			let result = await QLabelWorkApi.listLabelTasks();

			total = result.result.total;
			this.log.debug("总数 total:", total);
			result.result.data.forEach(item => {
				if (item.task_name === targetName) {
					targetTaskId = item.task_id;
					this.log.debug("找到了targetTaskId:", targetTaskId);
				}
			});
	
			this.log.debug("task_id:", targetTaskId);
			if (targetTaskId == null) {
				start += 10;
				QLabelWorkGlobal.cache.api.listLabelTasks.start = start;
				this.log.debug("if触发");
			} else {
				saveTaskId = targetTaskId;
				this.log.debug("else触发");
				break;
			}
		} while (start <= total);
		this.log.debug("最终 task_id:", targetTaskId);
		QLabelWorkGlobal.cache.cookie.task.taskId = saveTaskId;
		return targetTaskId;
	}
	// 通过任务ID获取题包key
	static async getPackKeyByTaskId() {
		const result = await QLabelWorkApi.queueLabel();
		let packKey = QLabelWorkGlobal.cache.cookie.task.packKey;
		if (result === null) {
			this.log.error("获取题包key失败, 返回结果为undefined");
			return;
		}
		this.log.debug("queueLabel 返回结果:", result);
		packKey = result.result.pack_key_list[0];
		QLabelWorkGlobal.cache.cookie.task.packKey = packKey;
		this.log.debug("获取到的题包key:", packKey);
		return packKey;
	}

	// 通过任务Id获取任务明细Id
	static async getDetailIdByTaskId() {
		let detailId;
		const result = await QLabelWorkApi.listMyLabelDetail();
		if (result == null) {
			this.log.error("未获取到任务明细Id");
		}
		detailId = result.result.data[0].detail_id;
		QLabelWorkGlobal.cache.cookie.task.detailId = detailId;
		this.log.log("获取到的detailId: ", detailId);
		return detailId;
	}
	static async updateDetailLabel() {
		await this.getDetailIdByTaskId();
		await QLabelWorkApi.saveLabel();
	}
}
class QLabelWorkGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "QLabelWorkGlobal.cache");
		this.setting = await super.initObject(this.setting, "QLabelWorkGlobal.setting");
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
				route: null,
			}
		},
		resultData: [
			{

			}
		],
	}
	static setting = {
		
	}
	static domMap = {

	}
}