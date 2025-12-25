class SettingBehavior extends Behavior {
	static __autoRegister = Behavior._register(this);
}
class SettingBehaviorHelperUtils extends SettingBehavior {
	static async updateStatusUI({ box, inputs = [], success, message }) {
		// 显示提示框
		box.classList.remove("hidden");

		// 清空两套提示框样式
		box.classList.remove("bg-blue-50","text-blue-500","border-blue-200");
		box.classList.remove("bg-red-50","text-red-500","border-red-200");

		// 设置提示框样式 & 图标
		const icon = box.querySelector("i");
		const text = box.querySelector("span");

		if (success) {
			box.classList.add("bg-blue-50","text-blue-500","border-blue-200");
			icon.classList.replace("fa-exclamation-circle", "fa-info-circle");
		} else {
			box.classList.add("bg-red-50","text-red-500","border-red-200");
			icon.classList.replace("fa-info-circle", "fa-exclamation-circle");
		}

		text.innerText = message;

		// 输入框成功失败样式
		inputs.forEach(input => {
			input.classList.remove("border-red-500","focus:ring-red-500");
			input.classList.remove("border-gray-300","focus:ring-blue-500");

			if (success) {
				input.classList.add("border-gray-300","focus:ring-blue-500");
			} else {
				input.classList.add("border-red-500","focus:ring-red-500");
			}
		});
	}

}
class SettingBehaviorBindEvent extends SettingBehavior {
	// Apibox 账号连通性测试
	static initApiboxAccountTest() {
		this.api_box_user_test_account_setting_button.addEventListener("click", async () => {
			ApiboxGlobal.cache.information.id = this.api_box_user_id_account_setting_input.value;
			ApiboxGlobal.cache.information.key = this.api_box_api_key_account_setting_input.value;

			let result = await ApiboxRequest.getInfo();

			SettingBehaviorHelperUtils.updateStatusUI({
				box: this.api_box_account_setting_message_box,
				inputs: [
					this.api_box_user_id_account_setting_input,
					this.api_box_api_key_account_setting_input
				],
				success: result.code === 200,
				message: result.code === 200
					? "API账号信息正确"
					: "错误代码: " + result.code + " " + result.msg
			});

			if (result.code !== 200) {
				ApiboxGlobal.cache.information.id = null;
				ApiboxGlobal.cache.information.key = null;
			}
		});
	}

	// W2 账号连通性测试
	static initW2AccountTest() {
		this.w2_user_test_account_setting_button.addEventListener("click", async () => {
			W2Global.cache.information.name = this.w2_user_name_account_setting_input.value;
			W2Global.cache.information.password = this.w2_user_password_account_setting_input.value;

			let result = await W2Request.getVerifyCode();

			SettingBehaviorHelperUtils.updateStatusUI({
				box: this.w2_account_setting_message_box,
				inputs: [
					this.w2_user_name_account_setting_input,
					this.w2_user_password_account_setting_input
				],
				success: result.code === 200,
				message: result.code === 200
					? "W2连通性测试无误, 已为邮箱发送验证码"
					: result.code === 5000
						? "W2账号信息错误"
						: "其他未知错误, 请重试"
			});

			if (result.code !== 200) {
				W2Global.cache.information.name = null;
				W2Global.cache.information.password = null;
			}
		});
	}

	// W2 邮箱 API + Apibox 联合测试
	static initW2EmailApiTest() {
		if (!DomHelper.exists(this.w2_email_api_test_account_setting_button)) return;

		this.w2_email_api_test_account_setting_button.addEventListener("click", async () => {
			ApiboxGlobal.cache.information.id = this.api_box_user_id_account_setting_input.value;
			ApiboxGlobal.cache.information.key = this.api_box_api_key_account_setting_input.value;
			W2Global.cache.information.address = this.w2_email_api_address_account_setting_input.value;
			W2Global.cache.information.pop3_auth_code = this.w2_email_api_pop3_auth_code_account_setting_input.value;

			let result = await ApiboxRequest.getInfo();

			if (result.code !== 200) {
				SettingBehaviorHelperUtils.updateStatusUI({
					box: this.w2_account_setting_message_box,
					inputs: [
						this.api_box_user_id_account_setting_input,
						this.api_box_api_key_account_setting_input,
						this.w2_email_api_address_account_setting_input,
						this.w2_email_api_pop3_auth_code_account_setting_input
					],
					success: false,
					message: "Apibox通讯ID与密钥错误"
				});

				ApiboxGlobal.cache.information.id = null;
				ApiboxGlobal.cache.information.key = null;
				W2Global.cache.information.address = null;
				W2Global.cache.information.pop3_auth_code = null;
				return;
			}

			result = await ApiboxRequest.getEmailApi();

			const success = result.code === 200;

			SettingBehaviorHelperUtils.updateStatusUI({
				box: this.w2_account_setting_message_box,
				inputs: [
					this.api_box_user_id_account_setting_input,
					this.api_box_api_key_account_setting_input,
					this.w2_email_api_address_account_setting_input,
					this.w2_email_api_pop3_auth_code_account_setting_input
				],
				success,
				message: success
					? "W2邮箱API连通性测试无误, 已获取邮箱列表"
					: "错误代码: " + result.code + " " + result.msg
			});

			if (!success) {
				W2Global.cache.information.address = null;
				W2Global.cache.information.pop3_auth_code = null;
			}
		});
	}

	// W2 时间段校验与保存
	static initW2TimeRangeSetting() {
		this.w2_time_range_validate_format_module_setting_button.addEventListener("click", async () => {
			const timeFields = [
				{
					startInput: this.w2_time_range_login_start_module_setting_input,
					endInput: this.w2_time_range_login_end_module_setting_input,
					configStart: "time_range_login_start",
					configEnd: "time_range_login_end",
					fieldName: "登录"
				},
				{
					startInput: this.w2_time_range_login_out_start_module_setting_input,
					endInput: this.w2_time_range_login_out_end_module_setting_input,
					configStart: "time_range_login_out_start",
					configEnd: "time_range_login_out_end",
					fieldName: "退出登录"
				},
				{
					startInput: this.w2_time_range_check_in_start_module_setting_input,
					endInput: this.w2_time_range_check_in_end_module_setting_input,
					configStart: "time_range_check_in_start",
					configEnd: "time_range_check_in_end",
					fieldName: "上班打卡"
				},
				{
					startInput: this.w2_time_range_check_out_start_module_setting_input,
					endInput: this.w2_time_range_check_out_end_module_setting_input,
					configStart: "time_range_check_out_start",
					configEnd: "time_range_check_out_end",
					fieldName: "下班打卡"
				},
				{
					startInput: this.w2_time_range_meal_start_module_setting_input,
					endInput: this.w2_time_range_meal_end_module_setting_input,
					configStart: "time_range_meal_start",
					configEnd: "time_range_meal_end",
					fieldName: "前往用餐"
				},
				{
					startInput: this.w2_time_range_working_start_module_setting_input,
					endInput: this.w2_time_range_working_end_module_setting_input,
					configStart: "time_range_working_start",
					configEnd: "time_range_working_end",
					fieldName: "切换标注"
				}
			];

			let hasError = false;
			let errorMessage = "";
			let errorInputs = [];

			for (const field of timeFields) {
				try {
					Time.getRandomTimeInRange(field.startInput.value, field.endInput.value);
				} catch (err) {
					hasError = true;
					errorMessage = field.fieldName + " 错误: " + err.message;
					errorInputs = [field.startInput, field.endInput];
					break;
				}
			}

			SettingBehaviorHelperUtils.updateStatusUI({
				box: this.w2_module_setting_message_box,
				inputs: hasError ? errorInputs : timeFields.flatMap(f => [f.startInput, f.endInput]),
				success: !hasError,
				message: hasError ? errorMessage : "时间段配置已保存"
			});

			if (!hasError) {
				for (const field of timeFields) {
					W2Global.setting[field.configStart] = field.startInput.value;
					W2Global.setting[field.configEnd] = field.endInput.value;
				}
				await W2Web.currentTask();
			}
		});
	}

	// QL 内嵌模块是否启用
	static initQLabelEmbeddeModuleTurnOnOrOff() {
		const toggle = this.ql_turn_or_off_module_setting_checkbox;
		toggle.addEventListener('change', function () {
			// 直接赋值
			QLabelEngineGlobal.setting.embeddeModule.TurnOnOrOff = toggle.checked;
		});
	}

	// LS 账号连通性测试
	static initLSAccountTest() {
		this.ls_user_test_account_setting_button.addEventListener("click", async () => {
			LSGlobal.cache.information.name = this.ls_user_name_account_setting_input.value;
			LSGlobal.cache.information.password = this.ls_user_password_account_setting_input.value;

			let result = await LSRequest.login();

			SettingBehaviorHelperUtils.updateStatusUI({
				box: this.ls_account_setting_message_box,
				inputs: [
					this.ls_user_name_account_setting_input,
					this.ls_user_password_account_setting_input
				],
				success: result.code === 200,
				message: result.code === 200
					? "LS连通性测试无误"
					: "其他未知错误, 请重试"
			});

			if (result.code !== 200) {
				LoginGlobal.cache.information.name = null;
				LoginGlobal.cache.information.password = null;
			}
		});
	}

	// LS 时间段校验与保存
	static initLSTimeRangeSetting() {
		if (!DomHelper.exists(this.ls_time_range_validate_format_module_setting_button)) return;

		this.ls_time_range_validate_format_module_setting_button.addEventListener("click", async () => {
			const timeFields = [
				{
					startInput: this.ls_time_range_login_start_module_setting_input,
					endInput: this.ls_time_range_login_end_module_setting_input,
					configStart: "time_range_login_start",
					configEnd: "time_range_login_end",
					fieldName: "登录"
				},
				{
					startInput: this.ls_time_range_login_out_start_module_setting_input,
					endInput: this.ls_time_range_login_out_end_module_setting_input,
					configStart: "time_range_login_out_start",
					configEnd: "time_range_login_out_end",
					fieldName: "退出登录"
				},
				{
					startInput: this.ls_time_range_fill_daily_report_start_module_setting_input,
					endInput: this.ls_time_range_fill_daily_report_end_module_setting_input,
					configStart: "time_range_fill_daily_report_start",
					configEnd: "time_range_fill_daily_report_end",
					fieldName: "填报日报"
				}
			];

			let hasError = false;
			let errorMessage = "";
			let errorInputs = [];

			for (const field of timeFields) {
				try {
					Time.getRandomTimeInRange(field.startInput.value, field.endInput.value);
				} catch (err) {
					hasError = true;
					errorMessage = field.fieldName + " 错误: " + err.message;
					errorInputs = [field.startInput, field.endInput];
					break;
				}
			}

			SettingBehaviorHelperUtils.updateStatusUI({
				box: this.ls_module_setting_message_box,
				inputs: hasError ? errorInputs : timeFields.flatMap(f => [f.startInput, f.endInput]),
				success: !hasError,
				message: hasError ? errorMessage : "时间段配置已保存"
			});

			if (!hasError) {
				for (const field of timeFields) {
					LSGlobal.setting[field.configStart] = field.startInput.value;
					LSGlobal.setting[field.configEnd] = field.endInput.value;
				}
			}
		});
	}

}
class SettingBehaviorUpdateUIElement extends SettingBehavior {
	// 更新文本框内容
	static async updateTextArea() {
		this.api_box_user_id_account_setting_input.value = ApiboxGlobal.cache.information.id;
		this.api_box_api_key_account_setting_input.value = ApiboxGlobal.cache.information.key;

		this.w2_user_name_account_setting_input.value = W2Global.cache.information.name;
		this.w2_user_password_account_setting_input.value = W2Global.cache.information.password;

		this.w2_email_api_address_account_setting_input.value = W2Global.cache.information.address;
		this.w2_email_api_pop3_auth_code_account_setting_input.value = W2Global.cache.information.pop3_auth_code;

		this.ls_user_name_account_setting_input.value = LSGlobal.cache.information.name;
		this.ls_user_password_account_setting_input.value = LSGlobal.cache.information.password;

		// W2 时间段设置
		this.w2_time_range_login_start_module_setting_input.value = W2Global.setting.time_range_login_start;
		this.w2_time_range_login_end_module_setting_input.value = W2Global.setting.time_range_login_end;

		this.w2_time_range_login_out_start_module_setting_input.value = W2Global.setting.time_range_login_out_start;
		this.w2_time_range_login_out_end_module_setting_input.value = W2Global.setting.time_range_login_out_end;

		this.w2_time_range_check_in_start_module_setting_input.value = W2Global.setting.time_range_check_in_start;
		this.w2_time_range_check_in_end_module_setting_input.value = W2Global.setting.time_range_check_in_end;

		this.w2_time_range_check_out_start_module_setting_input.value = W2Global.setting.time_range_check_out_start;
		this.w2_time_range_check_out_end_module_setting_input.value = W2Global.setting.time_range_check_out_end;

		this.w2_time_range_meal_start_module_setting_input.value = W2Global.setting.time_range_meal_start;
		this.w2_time_range_meal_end_module_setting_input.value = W2Global.setting.time_range_meal_end;

		this.w2_time_range_working_start_module_setting_input.value = W2Global.setting.time_range_working_start;
		this.w2_time_range_working_end_module_setting_input.value = W2Global.setting.time_range_working_end;
		// QL 引擎设置
		this.ql_turn_or_off_module_setting_checkbox.checked = QLabelEngineGlobal.setting.embeddeModule.TurnOnOrOff;

		this.ls_time_range_login_start_module_setting_input.value = LSGlobal.setting.time_range_login_start;
		this.ls_time_range_login_end_module_setting_input.value = LSGlobal.setting.time_range_login_end;
		this.ls_time_range_login_out_start_module_setting_input.value = LSGlobal.setting.time_range_login_out_start;
		this.ls_time_range_login_out_end_module_setting_input.value = LSGlobal.setting.time_range_login_out_end;
		this.ls_time_range_fill_daily_report_start_module_setting_input.value = LSGlobal.setting.time_range_fill_daily_report_start;
		this.ls_time_range_fill_daily_report_end_module_setting_input.value = LSGlobal.setting.time_range_fill_daily_report_end;
	}
}