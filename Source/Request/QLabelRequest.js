class QLabelRequrst extends HttpRequest {
	static log = new Logger("QLabelRequest");

}
class QLabelApi extends HttpRequest {
	// QLabel Api
	static config = {
		baseUrl: "https://qlabel.tencent.com/api/",
		defaultHeader: {
			"Content-Type": "application/json;charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			"sw8": "1-ZjE3NGEzMTMtN2EwYS00MzE5LTgxNDEtNWQ3NjRkNDM4YmZk-YmZkODkxZDYtOTg5OC00OWFhLWExMzUtYTFlNzkyNTdlNTk1-1-YWVnaXM=-MS40My43-L3dvcmtiZW5jaC93b3JrLXRpbWU=-cWxhYmVsLnRlbmNlbnQuY29t",
		}
	}
	constructor() {
		super();
	}
	// 获取标注总量列表
	static async getTotalAnnotationsList() {
		return await this._workbenchUserWorkingReport("total_annotations");
	}
	// 获取质检总量列表
	static async getQualityInspectionList() {
		return await this._workbenchUserWorkingReport("quality_inspection");
	}
	static async _workbenchUserWorkingReport(stat_type) {
		if (stat_type == "total_annotations") {
			stat_type = 1;
		} else if (stat_type == "quality_inspection") {
			stat_type = 2;
		}
		let startTime = QLabelGlobal.setting.annotationList.lookupTime.startTime;
		let endTime = QLabelGlobal.setting.annotationList.lookupTime.endTime;
		const url = "https://qlabel.tencent.com/api/report/workbenchUserWorkingReport";
		const headers = {
			...this.config.defaultHeader,
			"Cookie": "SESSION=" + 
				QLabelEngineGlobal.cache.cookie.local.session +
				"; tgw_l7_route=" + 
				QLabelEngineGlobal.cache.cookie.local.route
		};
		const data = {
			"jsonrpc": "2.0",
			"method": "workbenchUserWorkingReport",
			"id": 1763976310742,
			"params": {
				"page": {
					"start": 0,
					"size": 10,
					"return_total": 1
				},
				"user_id": "",
				"nick_name": "",
				"company_name": "",
				"task_id": "",
				"task_name": "",
				"team_id": "",
				"team_name": "",
				"template_level": "",
				"template_scene": "",
				"stat_type": stat_type,
				"cycle_step": 0,
				"begin_date": Time.getDateRangeByToday(startTime, endTime)[0] + " 00:00:00",
				"end_date": Time.getDateRangeByToday(startTime, endTime)[1] + " 00:00:00"
			}
		};
		this.log.log("_workbenchUserWorkingReport data", data);
		const result = await this._request("POST", url, headers, data);

		this.log.log("_workbenchUserWorkingReport result: ", result);
		
		return result;
	}
	static async _request(method, url, headers, data) {
		return await super.fetch({
			method,
			url,
			headers,
			data,
			responseType: "json",
		});
	}
}