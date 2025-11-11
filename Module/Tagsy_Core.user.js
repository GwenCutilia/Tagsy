// ==UserScript==
// @name			Tagsy_Core
// @namespace		http://tampermonkey.net/*
// @version			1.0.0
// @description		Tagsy的面板模块, 用于管理其他模块功能
// @author			Gwencutilia
// @icon			https://www.emojiall.com/images/60/microsoft/2728.png
// @match			file:///D:/Creat/VSCode/Tagsy_V2.0/Tagsy/Resource/Template/*
// @require			file:///D:/Creat/VSCode/Tagsy_V2.0/Tagsy/Module/Tagsy_Import.js
// @match			file:///C:/ProgramData/Tagsy/Resource/Template/*
// @require			file:///C:/ProgramData/Tagsy/Module/Tagsy_Import.js
// @match			https://weavefate.asia/Resource/Template/*
// @require			https://weavefate.asia/Module/Tagsy_Import.js
// @license			CC
// ==/UserScript==

(async function () {
	await ResourceLoader.loadAllResources();
	await core();
})();