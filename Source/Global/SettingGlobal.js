class SettingGlobal extends Global {
	static async init() {
		
	}
	static cache = {
		
	}
	static setting = {
		// QLabel内嵌模块
		qlabelWorkModule: {
			turnOnOrOff: true, // 是否开启QLabel内嵌模块
		}
	}
	static domMap = {
		// API盒子账号设置
		api_box_user_test_account_setting_button: "#api_box_user_test_account_setting_button",	// API盒子账号测试按钮
		api_box_user_id_account_setting_input: "#api_box_user_id_account_setting_input",	// API盒子通讯ID输入框
		api_box_api_key_account_setting_input: "#api_box_api_key_account_setting_input",	// API盒子通讯密钥输入框
		api_box_account_setting_message_box: "#api_box_account_setting_message_box",	// API盒子信息框

		// W2账号设置
		w2_user_test_account_setting_button: "#w2_user_test_account_setting_button",	// W2账号测试按钮
		w2_user_name_account_setting_input: "#w2_user_name_account_setting_input",	// W2账号输入框 账号
		w2_user_password_account_setting_input: "#w2_user_password_account_setting_input",	// W2密码输入框
		w2_email_api_test_account_setting_button: "#w2_email_api_test_account_setting_button",	// W2API测试按钮
		w2_email_api_address_account_setting_input: "#w2_email_api_address_account_setting_input",	// W2邮箱输入框
		w2_email_api_pop3_auth_code_account_setting_input: "#w2_email_api_pop3_auth_code_account_setting_input",	// W2POP3授权码输入框
		w2_account_setting_message_box: "#w2_account_setting_message_box",	// W2提示信息

		// W2模块设置
		w2_time_range_validate_format_module_setting_button: "#w2_time_range_validate_format_module_setting_button",	// W2验证格式按钮
		w2_time_range_login_start_module_setting_input: "#w2_time_range_login_start_module_setting_input",	// W2登录时间段开始输入框
		w2_time_range_login_end_module_setting_input: "#w2_time_range_login_end_module_setting_input",	// W2登录时间段结束输入框
		w2_time_range_login_out_start_module_setting_input: "#w2_time_range_login_out_start_module_setting_input",	// W2登出时间段开始输入框
		w2_time_range_login_out_end_module_setting_input: "#w2_time_range_login_out_end_module_setting_input",	// W2登出时间段结束输入框
		w2_time_range_check_in_start_module_setting_input: "#w2_time_range_check_in_start_module_setting_input",	// W2上班时间段开始输入框
		w2_time_range_check_in_end_module_setting_input: "#w2_time_range_check_in_end_module_setting_input",	// W2上班时间段结束输入框
		w2_time_range_check_out_start_module_setting_input: "#w2_time_range_check_out_start_module_setting_input",	// W2下班时间段开始输入框
		w2_time_range_check_out_end_module_setting_input: "#w2_time_range_check_out_end_module_setting_input",	// W2下班时间段结束输入框
		w2_time_range_meal_start_module_setting_input: "#w2_time_range_meal_start_module_setting_input",	// W2吃饭时间段开始输入框
		w2_time_range_meal_end_module_setting_input: "#w2_time_range_meal_end_module_setting_input",	// W2吃饭时间段结束输入框
		w2_time_range_working_start_module_setting_input: "#w2_time_range_working_start_module_setting_input",	// W2工作时间段开始输入框
		w2_time_range_working_end_module_setting_input: "#w2_time_range_working_end_module_setting_input",	// W2工作时间段结束输入框
		w2_module_setting_message_box: "#w2_module_setting_message_box",	// W2高级设置提示信息
		
		// QL内嵌模块设置
		qlabelEngine: {
			ql_turn_or_off_module_setting_checkbox: "#ql_turn_or_off_module_setting_checkbox", // 是否开启QL内嵌模块
		},

		// LS账号设置
		ls_user_test_account_setting_button: "#ls_user_test_account_setting_button",	// LS账号测试按钮
		ls_user_name_account_setting_input: "#ls_user_name_account_setting_input",	// LS账号输入框 账号
		ls_user_password_account_setting_input: "#ls_user_password_account_setting_input",	// LS密码输入框
		ls_account_setting_message_box: "#ls_account_setting_message_box",	// LS提示信息

		// LS模块设置
		ls_time_range_validate_format_module_setting_button: "#ls_time_range_validate_format_module_setting_button", // 格式校验按钮
		ls_time_range_login_start_module_setting_input: "#ls_time_range_login_start_module_setting_input",	// LS登录时间段开始输入框
		ls_time_range_login_end_module_setting_input: "#ls_time_range_login_end_module_setting_input",	// LS登录时间段结束输入框
		ls_time_range_login_out_start_module_setting_input: "#ls_time_range_login_out_start_module_setting_input",	// LS登出时间段开始输入框
		ls_time_range_login_out_end_module_setting_input: "#ls_time_range_login_out_end_module_setting_input",	// LS登出时间段结束输入框
		ls_time_range_fill_daily_report_start_module_setting_input: "#ls_time_range_fill_daily_report_start_module_setting_input",	// LS日报开始输入框
		ls_time_range_fill_daily_report_end_module_setting_input: "#ls_time_range_fill_daily_report_end_module_setting_input",	// LS日报结束输入框
		ls_module_setting_message_box: "#ls_module_setting_message_box",	// LS高级设置提示信息
	};
	// 字段映射
	static fieldMappings = [
		
	];


}