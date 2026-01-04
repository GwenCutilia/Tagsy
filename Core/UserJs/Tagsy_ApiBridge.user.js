// ==UserScript==
// @name		Tagsy_ApiBridge
// @namespace	http://tampermonkey.net/
// @version		1.0.0
// @description	Tagsy的前置模块, 用于将 GM_* API 挂载到全局作用域
// @author		Gwencutilia
// @match		*://*/*
// @icon		https://www.emojiall.com/images/60/microsoft/2728.png
// @grant		GM_getValue
// @grant		GM_setValue
// @grant		GM_deleteValue
// @grant		GM_listValues
// @grant		GM_addValueChangeListener
// @grant		GM_removeValueChangeListener
// @grant		GM_xmlhttpRequest
// @grant		GM_download
// @grant		GM_notification
// @grant		GM_openInTab
// @grant		GM_registerMenuCommand
// @grant		GM_unregisterMenuCommand
// @grant		GM_setClipboard
// @grant		GM_info
// @grant		GM_cookie
// @grant		GM_cookie.list
// @grant		GM_cookie.set
// @grant		GM_addStyle
// @connect		api.apihz.cn
// @connect		cn.apihz.cn
// @connect		api.jsonbin.io
// @connect		ark.cn-beijing.volces.com
// @connect		api-wanwei.myapp.com
// @connect		wanwei.myapp.com
// @connect		biaoju.labelvibe.com
// @connect		api.deepseek.com
// @connect		hunyuan-multimodal-1258344703.cos.ap-guangzhou.myqcloud.com
// @connect		drive.alittlesnowflake.uk
// @connect		api.ipify.org
// @connect		cloud.seatable.cn
// @connect		qlabel.tencent.com
// @run-at 		document-start
// @license		CC
// ==/UserScript==

(function () {
	const gmAPIs = [
		"GM_getValue",
		"GM_setValue",
		"GM_deleteValue",
		"GM_listValues",
		"GM_addValueChangeListener",
		"GM_removeValueChangeListener",
		"GM_xmlhttpRequest",
		"GM_download",
		"GM_notification",
		"GM_openInTab",
		"GM_registerMenuCommand",
		"GM_unregisterMenuCommand",
		"GM_setClipboard",
		"GM_info",
		"GM_cookie",
		"GM_cookie.list",
		"GM_cookie.set",
		"GM_addStyle"
	];

	unsafeWindow.TAGSY_GM = unsafeWindow.TAGSY_GM || {};
	unsafeWindow.GM = unsafeWindow.GM || {};

	function toPascalCase(apiName) {
		const parts = apiName.replace(new RegExp("GM_"), '').split(new RegExp("(?=[A-Z])")); // 构造函数内使用字符串
		return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
	}

	for (const api of gmAPIs) {
		// 处理 GM_cookie 的子函数
		if (api.startsWith("GM_cookie")) {
			if (typeof GM_cookie !== "undefined") {
				if (api === "GM_cookie") {
					unsafeWindow.TAGSY_GM.GM_cookie = GM_cookie;
					unsafeWindow.GM.Cookie = GM_cookie;
				} else if (api === "GM_cookie.list") {
					unsafeWindow.TAGSY_GM.GM_cookie_list = GM_cookie.list;
					unsafeWindow.GM.CookieList = GM_cookie.list;
				} else if (api === "GM_cookie.set") {
					unsafeWindow.TAGSY_GM.GM_cookie_set = GM_cookie.set;
					unsafeWindow.GM.CookieSet = GM_cookie.set;
				}
			}
			continue;
		}

		// 普通 GM_* API
		if (typeof window[api] !== "undefined") {
			const pascalName = toPascalCase(api);
			unsafeWindow.TAGSY_GM[api] = window[api];
			unsafeWindow.GM[pascalName] = window[api];
		}
	}

	// for (const api of gmAPIs) {
	// 	if (typeof window[api] !== "undefined") {
	// 		const pascalName = toPascalCase(api);
	// 		unsafeWindow.TAGSY_GM[api] = window[api]; 
	// 		unsafeWindow.GM[pascalName] = window[api]; 
	// 	}
	// }
})();