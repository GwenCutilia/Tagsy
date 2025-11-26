// Tagsy_Core.js
async function core() {
	// 初始化设置
	log = new Logger("Core");
	// 页面加载时实例化
	Route.init();
	Page.init();
}