// ==UserScript==
// @name			Tagsy_Core
// @namespace		http://tampermonkey.net/*
// @version			1.0.0
// @description		Tagsy的面板模块, 用于管理其他模块功能
// @author			Gwencutilia
// @icon			https://www.emojiall.com/images/60/microsoft/2728.png
// @match			http://127.0.0.1:5500/*
// @match			https://weavefate.asia/*
// @match			https://qlabel.tencent.com/*
// @require			http://127.0.0.1:5500/Module/Tagsy_Import.js
// @require			https://weavefate.asia/Module/Tagsy_Import.js
// @license			CC
// ==/UserScript==

(async function () {
	await ResourceLoader.loadAllResources();
	await core();
})();