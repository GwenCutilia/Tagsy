class LoginGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "LoginGlobal.cache");
		this.status = await super.initObject(this.status, "LoginGlobal.status");
	}
	static cache = {
		information: {
			name: null,
			password: null,
		},
		cookie: {
			uid: null,
			nick_name: null,
			avatar_url: null,
			query_id: null,
		}
	}
	static status = {
		login: false,
	}
	static domMap = {
		// 背景
		animation_canvas: "#animation_canvas",
		// 用户名&&密码
		infomation_div: "#infomation_div",
		password_toggle_btn: "#password_toggle_btn",
		username_input: "#username_input",
		password_input: "#password_input",
		// 登录&&注册
		login_btn: "#login_btn",
		register_btn: "#register_btn",
		// 二维码
		qr_div: "#qr_div",
		qr_toggle_btn: "#qr_toggle_btn",
		qr_url_img: "#qr_url_img",
	}
}