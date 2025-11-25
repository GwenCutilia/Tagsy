// ==UserScript==
// @name			Tagsy_QLabel_Lookup_Page_Test
// @namespace		http://tampermonkey.net/*
// @version			1.0.0
// @description		Tagsy的面板模块, 用于管理其他模块功能
// @author			Gwencutilia
// @icon			https://www.emojiall.com/images/60/microsoft/2728.png
// @match			https://qlabel.tencent.com/workbench/work-time
// @run-at			document-idle
// @license			CC
// ==/UserScript==

(function () {
	GM_cookie.list({}, cookieList => {
		const session = cookieList.find(c => c.name === "SESSION");
		console.log("SESSION:", session ? session.value : "Not Found");

		// 如果你要给页面注入数据，可以用 window 而不是 unsafeWindow
		window.TAGSY_COOKIE = {
			session: session ? session.value : null,
			all: cookieList
		};
	});
})();
