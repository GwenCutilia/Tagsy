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
		QLabelEngineGlobal.cache.cookie.local.sessionId = session.value;
		this.log.log("SESSION:", session.value);
	}
});
// Tool.js?v=1767086360834:51 2025/12/30 17:27:55Core:Log: SESSION: 6968e5d7-9b4d-41b4-b94e-9002446f13cb
// 跨域获取cookie
// 假设你想在 A 网站获取 B 网站 (tlabel.tencent.com) 的 cookie
const details = {
    url: "https://tlabel.tencent.com/", // 指定目标 URL
    // 或者用 domain: "tencent.com"
    name: "SESSION_ID" // 可选：如果你只想获取特定名称的 cookie
};

GM.CookieList(details, (cookies, error) => {
    if (error) {
        console.error("获取 Cookie 失败:", error);
    } else {
		console.log("获取到的 Cookies:", cookies);
        console.log("跨域获取到的 Cookies:", cookies[0].value);
    }
});
