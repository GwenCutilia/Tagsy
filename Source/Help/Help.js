// 该文件中包含了一些帮助类函数
// 获取所有cookie
GM.CookieList({}, list => {
	this.log.log("All cookies:", list);
});
// TLabel的cookie获取
// 获取 SESSION cookie
GM.CookieList({}, list => {
	const session = list.find(c => c.name === "SESSION_ID");
	if (session) {
		QLabelEngineGlobal.cache.cookie.local.session = session.value;
		this.log.log("SESSION:", session.value);
	}
});
// Tool.js?v=1767086360834:51 2025/12/30 17:27:55Core:Log: SESSION: 6968e5d7-9b4d-41b4-b94e-9002446f13cb
