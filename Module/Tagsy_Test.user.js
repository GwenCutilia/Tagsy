// ==UserScript==
// @name			Tagsy_Test
// @namespace		http://tampermonkey.net/*
// @version			1.0.0
// @description		Tagsy的测试模块, 用于测试模块功能
// @author			Gwencutilia
// @icon			https://www.emojiall.com/images/60/microsoft/2728.png
// @match			https://qlabel.tencent.com/workbench/tasks/*
// @require			file:///D:/Creat/VSCode/Tagsy_V2.0/Tagsy/Module/Common/Tagsy_Test.js
// @license			CC
// ==/UserScript==

(async function () {
	await ResourceLoader.loadAllResources();
	await test();
})();