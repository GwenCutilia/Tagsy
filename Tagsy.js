// ==UserScript==
// @name         Tagsy
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  自动标注! 解放双手! 尽情摸鱼!
// @author       Gwencutilia
// @match        https://qlabel.tencent.com/workbench/tasks/*
// @icon         https://www.emojiall.com/images/60/microsoft/2728.png
// @require      https://drive.alittlesnowflake.uk/Tagsy/Module/Tagsy_Import.js?v=1
// @license      CC
// ==/UserScript==
(async function () {
	await LoadGlobalAllScripts();
	ModelConfigs.DouBao.ApiKey = ""; 	// Doubao APIKey
	await InitScript();
})();