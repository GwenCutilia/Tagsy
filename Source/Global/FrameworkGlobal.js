class FrameworkGlobal extends Global {
	static async init() {
		this.cache = await super.initObject(this.cache, "FrameworkGlobal.cache");
	}
	// Framework 所需要的全局变量
	static cache = {
		notice: {
			content: null,
		}
	}
	// DOM元素映射表
	static domMap = {
		// 主页面遮罩loading
		main_area: "#main_area",
		main_loading: "#main_loading",
		// 用户头像
		user_avatar: "#user_avatar",
		// 消息中心
		notice_btn: "#notice_btn",
		notice_i: "#notice_i",
		notice_panel_div: "#notice_panel_div",
		notice_list_div: "#notice_list_div",
		notice_div: "#notice_div",
		notice_label: "#notice_label",
		notice_time_label: "#notice_time_label",
		notice_close: "#notice_close",

		// 底部导航栏
		model_status: "#model_status",
		model_status_w2_i: "#model_status_w2_i",
		model_status_w2_loading: "#model_status_w2_loading",
		model_status_w2_label: "#model_status_w2_label",
		model_status_ls_i: "#model_status_ls_i",
		model_status_ls_loading: "#model_status_ls_loading",
		model_status_ls_label: "#model_status_ls_label",

		// 天气状态
		weather_message_box: "#weather_message_box",
		weather_div: "#weather_div",
		weather_icon: "#weather_icon",
		weather_icon: "#weather_wind_icon",
		weather_temp_label: "#weather_temp_label",
		weather_city_label: "#weather_city_label",
		weather_wind_label: "#weather_wind_label"
	};
}