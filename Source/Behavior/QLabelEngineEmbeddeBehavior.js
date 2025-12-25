class QLabelEngineEmbeddeBehavior extends Behavior {
	static __autoRegister = Behavior._register(this);
}
class QLabelEngineEmbeddeBehaviorHelperUtils extends QLabelEngineEmbeddeBehavior {
	// 获取登录状态Cookie
	static async QLabelCookieInit() {
		await this.getLocalCookie();
	}
	// 获取Cookie
	static async getLocalCookie() {
		// 获取 SESSION cookie
		GM.CookieList({}, list => {
			const session = list.find(c => c.name === "SESSION");
			if (session) {
				QLabelEngineGlobal.cache.cookie.local.session = session.value;
				this.log.log("SESSION:", session.value);
			}
		});

		// 获取 tgw_l7_route cookie
		GM.CookieList({}, list => {
			const route = list.find(c => c.name === "tgw_l7_route");
			if (route) {
				QLabelEngineGlobal.cache.cookie.local.route = route.value;
				this.log.log("tgw_l7_route:", route.value);
			}
		});
	}
	// 保存题目
	static async updateDetailLabel() {
		await QLabelEngineRequest.updateDetailLabel();
	}
	
}

class QLabelEngineEmbeddeBehaviorBoundingBox extends QLabelEngineEmbeddeBehavior {
	// 拉框任务 返回已标注标签坐标等信息
	static collectTooltipObjects() {
		const nodes = DomHelper.allBySelector(".info-tooltip-content");
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
	// 拉框任务 获取当前页面的 DetailLabel
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
		const target = QLabelEngineGlobal.cache.cookie.pack.detailLabel;
		for (const key in currentDetailLabel) {
			target[key] = currentDetailLabel[key];
		}

		this.log.log("currentDetailLabel:", currentDetailLabel);
		this.log.debug(
			"QLabelEngineGlobal.cache.cookie.pack.detailLabel:",
			QLabelEngineGlobal.cache.cookie.pack.detailLabel
		);
	}
}