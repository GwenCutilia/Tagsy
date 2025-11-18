const RULE_ID = 1

// 添加或更新移除CSP规则
async function addRemoveCSPRule() {
	try {
		// 先删除旧规则，避免重复添加
		await chrome.declarativeNetRequest.updateSessionRules({
			removeRuleIds: [RULE_ID]
		})

		// 添加新的规则，拦截所有主框架和子框架请求，清空CSP响应头
		await chrome.declarativeNetRequest.updateSessionRules({
			addRules: [{
				id: RULE_ID,
				priority: 1,
				action: {
					type: "modifyHeaders",
					responseHeaders: [{
						header: "content-security-policy",
						operation: "set",
						value: ""
					}]
				},
				condition: {
					urlFilter: "*",
					resourceTypes: ["main_frame", "sub_frame"]
				}
			}]
		})

		console.log("Tagsy_Extension: CSP移除规则已生效")
	} catch (error) {
		console.error("Tagsy_Extension: 添加CSP规则失败", error)
	}
}

// 插件启动时立即调用
addRemoveCSPRule()

// 安装或更新时调用
chrome.runtime.onInstalled.addListener(() => {
	addRemoveCSPRule()
})

// 激活标签时调用
chrome.tabs.onActivated.addListener(() => {
	addRemoveCSPRule()
})

// 页面加载完成时调用（尽量保证规则随时生效）
chrome.webNavigation.onCompleted.addListener(() => {
	addRemoveCSPRule()
})