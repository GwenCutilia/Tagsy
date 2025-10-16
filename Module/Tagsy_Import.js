// /*
// *********************
// 	***引导函数***
// *********************
// */
// 加载单个脚本
async function loadScriptAsync(scriptUrl) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = scriptUrl + `?v=${Date.now()}`;
		script.dataset.dynamic = "true";
		script.onload = () => resolve(1); // 成功返回 1
		script.onerror = () => reject(new Error(`Failed to load: ${scriptUrl}`));
		document.head.appendChild(script);
	});
}

// 并行加载一组脚本
async function loadScriptsParallel(scripts) {
	const results = await Promise.all(
		scripts.map(url =>
			loadScriptAsync(url).catch(err => {
				console.error(err);
				return 0; // 失败返回 0
			})
		)
	);
	return results.reduce((sum, val) => sum + val, 0); // 成功数量
}

// 分组顺序加载, 每组内部并行
async function loadScriptsByGroups(groups) {
	let totalSuccess = 0;
	for (const group of groups) {
		totalSuccess += await loadScriptsParallel(group);
	}
	return totalSuccess;
}

// 全局加载入口
async function LoadGlobalAllScripts() {
	const ExternalUrl = "https://cdn.tailwindcss.com/";
	const Url = "file:///D:/Creat/VSCode/Tagsy_V2.0/Tagsy/";
	// 脚本分组
	const resource = [
		[
			ExternalUrl + "3.4.17",
			Url + "Utils/Tool.js",
		],
		[
			Url + "Utils/Manager/Component.js",
			Url + "Utils/Manager/Request.js",
			Url + "Utils/Manager/Page.js",
			Url + "Utils/Unit.js",
		],
		[
			Url + "Variable/Global.js",
			Url + "Variable/Message.js",
		],
		[
			Url + "Module/Tagsy_Import.js",
			Url + "Module/Common/Tagsy_Core.js",
		]
	];

	// 执行加载
	const scriptsAdd = await loadScriptsByGroups(resource);
	const totalScripts = resource.flat().length;

	// 保存状态
	Resource.scriptsAdd = scriptsAdd;
	Resource.scriptsNum = totalScripts;
}