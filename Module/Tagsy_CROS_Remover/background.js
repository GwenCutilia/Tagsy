const RULE_ID = 1;

async function addRemoveCORSAndFileRule() {
	const rule = {
		id: RULE_ID,
		priority: 1,
		action: {
			type: "modifyHeaders",
			responseHeaders: [
				{ header: "Access-Control-Allow-Origin", operation: "set", value: "*" },
				{ header: "Access-Control-Allow-Methods", operation: "set", value: "GET, POST, PUT, DELETE, OPTIONS" },
				{ header: "Access-Control-Allow-Headers", operation: "set", value: "*" }
			]
		},
		condition: {
			urlFilter: "*",
			resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "script", "stylesheet"]
		}
	};

	// 删除旧规则（如果存在）
	try {
		await chrome.declarativeNetRequest.updateSessionRules({
			removeRuleIds: [RULE_ID]
		});
	} catch(e) { /* 忽略 */ }

	// 添加新规则
	try {
		await chrome.declarativeNetRequest.updateSessionRules({
			addRules: [rule]
		});
		console.log("Tagsy_Extension: CORS + 本地文件规则已生效");
	} catch (error) {
		console.error("Tagsy_Extension: 添加规则失败", error);
	}
}

// 扩展生命周期事件
chrome.runtime.onInstalled.addListener(() => addRemoveCORSAndFileRule());
chrome.runtime.onStartup.addListener(() => addRemoveCORSAndFileRule());
chrome.tabs.onActivated.addListener(() => addRemoveCORSAndFileRule());
chrome.webNavigation.onCompleted.addListener(() => addRemoveCORSAndFileRule());
