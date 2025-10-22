/*
	***** 全局工具函数 *****
*/

/**
 * Logger 类 - 用于统一控制台日志输出, 支持不同日志等级和颜色显示.
 * 
 * @class
 * @example
 * // 实例使用
 * const log = new Logger("MyApp");
 * log.log("实例普通日志");
 * log.debug("实例调试日志", { key: "value" });
 * log.warn("实例警告信息");
 * log.error("实例错误信息");
 */
class Logger {
	/**
	 * 创建一个 Logger 实例
	 * 
	 * @param {string} [prefix = "Logger"] - 日志前缀, 用于标识日志来源
	 * @example
	 * const log = new Logger("MyApp");
	 */
	constructor(prefix = "Logger") {
		this.prefix = prefix;
	}

	/**
	 * 内部通用日志打印函数
	 * 
	 * @private
	 * @param {string} level - 日志等级, 可为 "Log" | "Debug" | "Warn" | "Error"
	 * @param {...any} text - 要打印的内容
	 */
	_log(level, ...text) {
		let time = new Date().toLocaleString();
		let header = `${time}\n${this.prefix}:\n${level}:`;

		switch (level) {
			case "Debug":
				console.log(`%c${header}`, "color: blue;", ...text);
				break;
			case "Warn":
				console.warn(`%c${header}`, "color: orange;", ...text);
				break;
			case "Error":
				console.error(`%c${header}`, "color: red;", ...text);
				break;
			default: // "Log"
				console.log(`%c${header}`, "color: green;", ...text);
		}
	}

	/**
	 * 普通日志输出（绿色）
	 * 
	 * @param {...any} text - 要输出的内容
	 * @example
	 * const log = new Logger("MyApp");
	 * log.log("普通日志");
	 */
	log(...text) {
		this._log("Log", ...text);
	}

	/**
	 * 调试日志输出（蓝色）
	 * 
	 * @param {...any} text - 要输出的调试信息
	 * @example
	 * const log = new Logger("MyApp");
	 * log.debug("变量值", someVar);
	 */
	debug(...text) {
		this._log("Debug", ...text);
	}

	/**
	 * 警告日志输出（黄色）
	 * 
	 * @param {...any} text - 要输出的警告信息
	 * @example
	 * const log = new Logger("MyApp");
	 * log.warn("接口返回异常", response.status);
	 */
	warn(...text) {
		this._log("Warn", ...text);
	}

	/**
	 * 错误日志输出（红色）
	 * 
	 * @param {...any} text - 要输出的错误信息
	 * @example
	 * const log = new Logger("MyApp");
	 * log.error("请求失败", error);
	 */
	error(...text) {
		this._log("Error", ...text);
	}
}

/**
 * DOM 操作辅助工具类。
 * 提供基于 id、name、tag、XPath 和 CSS 选择器的便捷查找方法, 
 * 如果未找到目标元素, 会通过 Logger 输出警告信息。
 *
 * @example
 * // 获取 id 为 "myId" 的元素
 * const elem = DomHelper.byId("myId");
 *
 * @example
 * // 获取所有 div 元素
 * const divs = DomHelper.byTag("div");
 */
class DomHelper {
	static log = new Logger("DomHelper");
	/**
	 * 根据 id 获取元素。
	 * @param {string} id - 元素的 id。
	 * @returns {HTMLElement|null} 匹配的元素或 null。
	 */
	static byId(id) {
		const elem = document.getElementById(id);
		if (!elem) log.warn(`未找到 id="${id}" 的元素`);
		return elem;
	}

	/**
	 * 根据 name 获取元素集合。
	 * @param {string} name - 元素的 name 属性值。
	 * @returns {NodeListOf<HTMLElement>} 匹配的元素集合。
	 */
	static byName(name) {
		const elems = document.getElementsByName(name);
		if (!elems || elems.length === 0) this.log.warn(`未找到 name="${name}" 的元素`);
		return elems;
	}

	/**
	 * 根据标签名获取元素集合。
	 * @param {string} tagName - 标签名, 例如 "div"。
	 * @returns {HTMLCollectionOf<HTMLElement>} 匹配的元素集合。
	 */
	static byTag(tagName) {
		const elems = document.getElementsByTagName(tagName);
		if (!elems || elems.length === 0) this.log.warn(`未找到 <${tagName}> 标签元素`);
		return elems;
	}

	/**
	 * 在指定父元素内, 根据标签名获取元素集合。
	 * @param {HTMLElement|DocumentFragment} parent - 父元素或文档碎片。
	 * @param {string} tagName - 标签名。
	 * @returns {HTMLCollectionOf<HTMLElement>} 匹配的元素集合。
	 */
	static byTagFromParent(parent, tagName) {
		const elems = parent.getElementsByTagName(tagName);
		if (!elems || elems.length === 0) this.log.warn(`在父元素中未找到 <${tagName}> 标签`);
		return elems;
	}

	/**
	 * 在指定父元素内, 根据 name 获取元素集合。
	 * @param {HTMLElement|DocumentFragment} parent - 父元素或文档碎片。
	 * @param {string} name - 元素的 name 属性值。
	 * @returns {NodeListOf<HTMLElement>} 匹配的元素集合。
	 */
	static byNameFromParent(parent, name) {
		const elems = parent.querySelectorAll(`[name="${name}"]`);
		if (!elems || elems.length === 0) this.log.warn(`在父元素中未找到 name="${name}" 的元素`);
		return elems;
	}

	/**
	 * 根据 XPath 获取第一个匹配的节点。
	 * @param {string} xpath - XPath 表达式。
	 * @returns {Node|null} 匹配的节点或 null。
	 */
	static byXpath(xpath) {
		const node = document.evaluate(
			xpath,
			document.body,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
		if (!node) this.log.warn(`未找到 XPath="${xpath}" 的节点`);
		return node;
	}

	/**
	 * 根据 CSS 选择器获取第一个匹配的元素。
	 * @param {string} selector - CSS 选择器。
	 * @returns {Element|null} 匹配的元素或 null。
	 */
	static bySelector(selector) {
		const elem = document.querySelector(selector);
		if (!elem) this.log.warn(`未找到选择器 "${selector}" 的元素`);
		return elem;
	}

	/**
	 * 根据 CSS 选择器获取所有匹配的元素集合。
	 * @param {string} selector - CSS 选择器。
	 * @returns {NodeListOf<Element>} 匹配的元素集合。
	 */
	static allBySelector(selector) {
		const elems = document.querySelectorAll(selector);
		if (!elems || elems.length === 0) this.log.warn(`未找到选择器 "${selector}" 的元素集合`);
		return elems;
	}

	/**
	 * 在指定父元素内, 根据 CSS 选择器获取第一个匹配的元素。
	 * @param {HTMLElement|DocumentFragment} parent - 父元素。
	 * @param {string} selector - CSS 选择器。
	 * @returns {Element|null} 匹配的元素或 null。
	 */
	static bySelectorFromParent(parent, selector) {
		const elem = parent.querySelector(selector);
		if (!elem) this.log.warn(`在父元素中未找到选择器 "${selector}" 的元素`);
		return elem;
	}

	/**
	 * 在指定父元素内, 根据 CSS 选择器获取所有匹配的元素集合。
	 * @param {HTMLElement|DocumentFragment} parent - 父元素。
	 * @param {string} selector - CSS 选择器。
	 * @returns {NodeListOf<Element>} 匹配的元素集合。
	 */
	static allBySelectorFromParent(parent, selector) {
		const elems = parent.querySelectorAll(selector);
		if (!elems || elems.length === 0) this.log.warn(`在父元素中未找到选择器 "${selector}" 的元素集合`);
		return elems;
	}

	/**
	 * 创建DOM元素或文本节点
	 * @param {string} type - 元素类型："div", "span", "text" 等
	 * @param {Object} [options] - 配置选项
	 * @param {Object} [options.attrs] - 元素属性对象
	 * @param {string} [options.text] - 文本内容（用于文本节点或元素的textContent）
	 * @param {string} [options.html] - HTML内容（设置innerHTML）
	 * @param {Array|Node} [options.children] - 子元素数组或单个子元素
	 * @param {Object} [options.style] - 样式对象
	 * @param {string} [options.className] - CSS类名
	 * @param {string} [options.id] - 元素ID
	 * @returns {HTMLElement|Text} 创建的DOM元素或文本节点
	 */
	static createDom(type, options = {}) {
		if (type.toLowerCase() === "text") {
			return document.createTextNode(options.text || "");
		}

		const element = document.createElement(type);
		
		// 设置属性
		if (options.attrs) {
			for (const [key, value] of Object.entries(options.attrs)) {
				if (value !== null && value !== undefined) {
					element.setAttribute(key, value);
				}
			}
		}
		
		// 设置ID
		if (options.id) {
			element.id = options.id;
		}
		
		// 设置类名
		if (options.className) {
			element.className = options.className;
		}
		
		// 设置样式
		if (options.style) {
			Object.assign(element.style, options.style);
		}
		
		// 设置文本内容
		if (options.text) {
			element.textContent = options.text;
		}
		
		// 设置HTML内容
		if (options.html) {
			element.innerHTML = options.html;
		}
		
		// 添加子元素
		if (options.children) {
			const children = Array.isArray(options.children) ? options.children : [options.children];
			children.forEach(child => {
				if (child) {
					element.appendChild(child instanceof Node ? child : this.createDom(child.type, child));
				}
			});
		}
		
		return element;
	}

	/**
	 * 判断 DOM 元素是否存在
	 * @param {string|Element} selectorOrElem - CSS选择器字符串 或 已有元素
	 * @param {boolean} [warn = true] - 如果不存在是否打印警告
	 * @returns {boolean} - 元素存在返回 true, 不存在返回 false
	 */
	static exists(selectorOrElem, warn = true) {
		let elem;
		if (typeof selectorOrElem === "string") {
			elem = document.querySelector(selectorOrElem);
		} else if (selectorOrElem instanceof Element) {
			elem = selectorOrElem;
		} else {
			if (warn) this.log.warn("传入的参数既不是选择器也不是 HTMLElement");
			return false;
		}

		if (!elem) {
			if (warn) this.log.warn(`元素不存在: ${typeof selectorOrElem === "string" ? selectorOrElem : elem}`);
			return false;
		}
		return true;
	}
}

class HttpRequest {
	/**
	 * 静态异步请求方法, 基于 GM.XmlhttpRequest 封装
	 * @param {Object} options - 请求配置对象
	 * @param {string} options.url - 请求URL
	 * @param {string} [options.method="GET"] - HTTP请求方法
	 * @param {Object} [options.headers={}] - 请求头对象
	 * @param {any} [options.data=null] - 请求体数据
	 * @param {string} [options.responseType="json"] - 响应类型
	 * @returns {Promise<any>} 返回请求结果的Promise
	 */
	static async fetch(options) {
		return new Promise((resolve, reject) => {
			let data = options.data;

			// 如果是对象且 Content-Type 是表单格式, 转换为 URL 编码字符串
			if (data && typeof data === "object" && !(data instanceof FormData)) {
				const contentType = options.headers?.["Content-Type"] || options.headers?.["content-type"];
				
				if (contentType && contentType.includes("application/x-www-form-urlencoded")) {
					data = new URLSearchParams(data).toString();
				} else if (contentType && contentType.includes("application/json")) {
					data = JSON.stringify(data);
					if (!options.headers) options.headers = {};
					options.headers["Content-Type"] = "application/json;charset=UTF-8";
				}
			}

			GM.XmlhttpRequest({
				method: options.method || "GET",
				url: options.url,
				headers: options.headers || {},
				data: data || null,
				responseType: options.responseType || "json",
				onload(response) {
					if (response.status >= 200 && response.status < 300) {
						resolve(response.response);
					} else {
						reject(new Error(`请求失败, 状态码: ${response.status}`));
					}
				},
				onerror(error) {
					reject(error);
				}
			});
		});
	}
	
	/**
	 * 静态GET快捷方法
	 */
	static get(url, headers = {}) {
		return this.fetch({ url, method: "GET", headers });
	}

	/**
	 * 静态POST快捷方法
	 */
	static post(url, data = {}, headers = {}) {
		return this.fetch({ url, method: "POST", headers, data });
	}
}

class System {
	// 休眠函数
	/**
	 * 休眠指定毫秒数, 返回一个Promise, 方便await调用. 
	 * 
	 * @param {number} ms - 要休眠的毫秒数
	 * @returns {Promise<void>} 一个在指定时间后完成的Promise
	 * 
	 * @example
	 * // 休眠1秒
	 * await Sleep(1000);
	 */
	static async sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * 休眠指定秒数, 底层调用Sleep函数. 
	 * 
	 * @param {number} seconds - 要休眠的秒数
	 * @returns {Promise<void>} 一个在指定时间后完成的Promise
	 * 
	 * @example
	 * // 休眠3秒
	 * await SleepSeconds(3);
	 */
	static async sleepSeconds(seconds) {
		await this.sleep(seconds * 1000);
	}
}

class Time {
	// 私有构造函数: 禁止实例化（确保静态类特性）
	constructor() {
		throw new Error('Time 是静态类, 无需实例化, 直接通过 Time.xxx 调用方法');
	}

	/**
	 * 私有静态工具: 解析日期字符串为标准 Date 对象（修复正则bug, 确保解析正常）
	 * 支持格式: YYYY-MM-DD、YYYY年MM月DD日、YYYYMMDD
	 * @param {string} dateStr - 要解析的日期字符串
	 * @returns {Date} 标准 Date 对象（时间重置为 00:00:00）
	 * @throws {Error} 日期格式无效时抛出错误
	 */
	static _parseDate(dateStr) {
		// 修复正则: 移除多余斜杠, 修正简洁格式匹配（字符串中 \d 需转义为 \\d）
		let normalizedDate = dateStr.trim()
		.replace(new RegExp("年|月", "g"), '-')  // 中文格式转 "-": "2024年09月25日" → "2024-09-25日"
		.replace(new RegExp("日", "g"), '');     // 去掉 "日": "2024-09-25日" → "2024-09-25"
		
		// 处理简洁格式（YYYYMMDD）: "20240925" → "2024-09-25"（修复正则转义）
		if (new RegExp("^\\d{8}$").test(normalizedDate)) {
		normalizedDate = `${normalizedDate.slice(0,4)}-${normalizedDate.slice(4,6)}-${normalizedDate.slice(6,8)}`;
		}

		// 验证解析结果（排除无效日期, 如 "2024-02-30"）
		const parsedDate = new Date(normalizedDate);
		if (isNaN(parsedDate.getTime())) {
		throw new Error(`Time._parseDate: 无效的日期格式 "${dateStr}", 支持格式: YYYY-MM-DD/YYYY年MM月DD日/YYYYMMDD`);
		}

		// 重置时间为 00:00:00（确保仅对比“日期”, 不对比“时间”）
		parsedDate.setHours(0, 0, 0, 0);
		return parsedDate;
	}

	/**
	 * 私有静态工具: 给数字补零（用于月份/日期/时分秒的两位数格式）
	 * @param {number} num - 需补零的数字（如 5 → 05, 12 → 12）
	 * @returns {string} 补零后的两位数字符串
	 */
	static _padZero(num) {
		return num.toString().padStart(2, '0');
	}

	/**
	 * 核心方法: 获取当前日期（支持多种格式）
	 * @param {string} [format='default'] - 日期格式（可选）
	 * - 'default': 默认格式 → YYYY-MM-DD（如 2024-09-25）
	 * - 'cn': 中文格式 → YYYY年MM月DD日（如 2024年09月25日）
	 * - 'short': 简洁格式 → YYYYMMDD（如 20240925）
	 * @returns {string} 格式化后的当前日期字符串
	 * @throws {Error} 传入不支持的格式时抛出错误
	 */
	static getCurrentDate(format = 'default') {
		const now = new Date();
		const year = now.getFullYear();
		const month = this._padZero(now.getMonth() + 1); // 修复月份 0-11 → 1-12
		const date = this._padZero(now.getDate());

		switch (format.toLowerCase()) {
		case 'default':
			return `${year}-${month}-${date}`;
		case 'cn':
			return `${year}年${month}月${date}日`;
		case 'short':
			return `${year}${month}${date}`;
		default:
			throw new Error(`Time.getCurrentDate: 不支持的格式 "${format}", 可选格式: default/cn/short`);
		}
	}

	/**
	 * 获取当前月份
	 * @param {string} [format='default'] - 日期格式
	 * - 'default': 默认格式 → MM（如 09）
	 * - 'cn': 中文格式 → MM（如 09）
	 * - 'number': 数字格式 → 1-12（如 9）
	 * @returns {string} 格式化后的当前月份字符串
	 * @throws {Error} 传入不支持的格式时抛出错误
	 */
	static getCurrentMonth(format = 'default') {
		const now = new Date();
		const month = now.getMonth() + 1; // 月份从 0-11 转为 1-12

		switch (format.toLowerCase()) {
		case 'default':
			return this._padZero(month);
		case 'cn':
			return this._padZero(month);
		case 'number':
			return month.toString();
		default:
			throw new Error(`Time.getCurrentMonth: 不支持的格式 "${format}", 可选格式: default/cn/number`);
		}
	}

	/**
	 * 获取当前年份
	 * @param {string} [format='default'] - 日期格式
	 * - 'default': 默认格式 → YYYY（如 2024）
	 * - 'cn': 中文格式 → YYYY（如 2024）
	 * @returns {string} 格式化后的当前年份字符串
	 * @throws {Error} 传入不支持的格式时抛出错误
	 */
	static getCurrentYear(format = 'default') {
		const now = new Date();
		const year = now.getFullYear();

		switch (format.toLowerCase()) {
		case 'default':
			return year.toString();
		case 'cn':
			return year.toString();
		default:
			throw new Error(`Time.getCurrentYear: 不支持的格式 "${format}", 可选格式: default/cn`);
		}
	}

	/**
	 * 获取指定月份或当前月份的开始日期/结束日期（支持多种格式）
	 * @param {number|string} monthOrType - 月份数字(1-12)或日期类型
	 * - 数字: 指定月份 (如 10 表示10月)
	 * - 'beginDate': 返回当前月份的第一天
	 * - 'endDate': 返回当前月份的最后一天
	 * @param {string} [typeOrFormat] - 日期类型或格式
	 * - 当第一个参数是数字时: 'beginDate' 或 'endDate'
	 * - 当第一个参数是字符串时: 日期格式 ('default'/'cn'/'short')
	 * @param {string} [format='default'] - 日期格式 (仅在第一个参数是数字时需要)
	 * - 'default': 默认格式 → YYYY-MM-DD（如 2024-09-25）
	 * - 'cn': 中文格式 → YYYY年MM月DD日（如 2024年09月25日）
	 * - 'short': 简洁格式 → YYYYMMDD（如 20240925）
	 * @returns {string} 格式化后的日期字符串
	 * @throws {Error} 参数不合法时抛出错误
	 * @example
	 * // 获取当前月份的第一天
	 * const beginDate1 = Time.getCurrentMonthBoundary("beginDate"); // 返回 "2024-09-01"
	 * const beginDate2 = Time.getCurrentMonthBoundary("beginDate", "cn"); // 返回 "2024年09月01日"
	 * 
	 * // 获取指定月份的第一天或最后一天
	 * const octBegin = Time.getCurrentMonthBoundary(10, "beginDate"); // 返回 "2024-10-01"
	 * const octEnd = Time.getCurrentMonthBoundary(10, "endDate", "cn"); // 返回 "2024年10月31日"
	 */
	static getCurrentMonthBoundary(monthOrType, typeOrFormat, format = 'default') {
		let month, type, finalFormat;
		
		// 参数解析逻辑 - 增强对字符串数字的处理
		if (typeof monthOrType === 'number' || (typeof monthOrType === 'string' && !isNaN(monthOrType))) {
			// 第一种调用方式: getCurrentMonthBoundary(10, "beginDate", "cn")
			// 或者 getCurrentMonthBoundary("10", "beginDate", "cn")
			month = Number(monthOrType); // 确保转换为数字
			type = typeOrFormat;
			finalFormat = format;
			
			// 校验月份范围
			if (month < 1 || month > 12) {
				throw new Error(`Time.getCurrentMonthBoundary: 月份必须在 1-12 之间, 当前为 ${month}`);
			}
		} else if (typeof monthOrType === 'string') {
			// 第二种调用方式: getCurrentMonthBoundary("beginDate", "cn")
			month = new Date().getMonth() + 1; // 当前月份
			type = monthOrType;
			finalFormat = typeOrFormat || 'default';
		} else {
			throw new Error(`Time.getCurrentMonthBoundary: 第一个参数必须是数字或字符串, 当前为 ${typeof monthOrType}`);
		}
		
		// 校验类型参数
		if (type !== 'beginDate' && type !== 'endDate') {
			throw new Error(`Time.getCurrentMonthBoundary: 无效的类型 "${type}", 必须是 "beginDate" 或 "endDate"`);
		}

		const now = new Date();
		const year = now.getFullYear();
		
		let dayNumber;
		
		if (type === 'beginDate') {
			dayNumber = 1; // 月份第一天总是1号
		} else { // endDate
			// 获取指定月份的最后一天
			dayNumber = new Date(year, month, 0).getDate();
		}

		const monthStr = this._padZero(month);
		const dayStr = this._padZero(dayNumber);

		switch (finalFormat.toLowerCase()) {
			case 'default':
				return `${year}-${monthStr}-${dayStr}`;
			case 'cn':
				return `${year}年${monthStr}月${dayStr}日`;
			case 'short':
				return `${year}${monthStr}${dayStr}`;
			default:
				throw new Error(`Time.getCurrentMonthBoundary: 不支持的格式 "${finalFormat}", 可选格式: default/cn/short`);
		}
	}

	/**
	 * 获取指定月份的第一天的周几
	 * @param {string} dateStr - 日期字符串（如 "2024-09-25"、"2024年09月25日"）
	 * @returns {number} 星期几（0-6, 0代表星期日）
	 * @throws {Error} 日期格式无效时抛出错误
	 */
	static getFirstDayOfMonthWeek(dateStr) {
		const date = this._parseDate(dateStr);
		// 创建当月第一天的日期对象
		const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		return firstDay.getDay();
	}

	/**
	 * 判断指定日期是否是今天
	 * @param {Date|string} date - 要判断的日期（Date对象或日期字符串）
	 * @returns {boolean} true = 是今天, false = 不是今天
	 */
	static isToday(date) {
		if (typeof date === 'string') {
			date = this._parseDate(date);
		}
		const today = new Date();
		return date.toDateString() === today.toDateString();
	}

	/**
	 * 新增: 获取今天指定时分秒的秒级时间戳（UTC时间戳）
	 * @param {number} [hour=0] - 小时（0-23, 默认0）
	 * @param {number} [minute=0] - 分钟（0-59, 默认0）
	 * @param {number} [second=0] - 秒（0-59, 默认0）
	 * @returns {number} 对应时间的秒级时间戳（如 1727241600 对应 2024-09-25 08:00:00）
	 * @throws {Error} 时分秒超出有效范围时抛出错误
	 * @example
	 * // 获取今天 14:30:00 的时间戳
	 * const timestamp = Time.getTodayTimestamp(14, 30, 0);
	 */
	static getTodayTimestamp(hour = 0, minute = 0, second = 0) {
		// 参数合法性校验（与类内错误风格统一）
		if (hour < 0 || hour > 23) {
		throw new Error(`Time.getTodayTimestamp: 无效的小时数 "${hour}", 必须在 0-23 之间`);
		}
		if (minute < 0 || minute > 59) {
		throw new Error(`Time.getTodayTimestamp: 无效的分钟数 "${minute}", 必须在 0-59 之间`);
		}
		if (second < 0 || second > 59) {
		throw new Error(`Time.getTodayTimestamp: 无效的秒数 "${second}", 必须在 0-59 之间`);
		}

		// 基于今天的年/月/日, 创建指定时分秒的时间对象
		const now = new Date();
		const targetTime = new Date(
		now.getFullYear(),    // 今年
		now.getMonth(),       // 本月（原生 0-11, 无需+1, Date构造函数兼容）
		now.getDate(),        // 今天
		hour,                 // 指定小时
		minute,               // 指定分钟
		second                // 指定秒
		);

		// 转换为秒级时间戳（毫秒 → 秒, 向下取整）
		return Math.floor(targetTime.getTime() / 1000);
	}

	/**
	 * 判断日期 A 和日期 B 是否相等（仅对比“日期”, 忽略时间）
	 * @param {string} dateA - 要判断的日期 A（如 "2024-09-25"、"2024年09月25日"）
	 * @param {string} dateB - 对比基准日期 B（格式同 dateA）
	 * @returns {boolean} true=相等, false=不相等
	 */
	static isEqual(dateA, dateB) {
		const a = this._parseDate(dateA);
		const b = this._parseDate(dateB);
		return a.getTime() === b.getTime();
	}

	/**
	 * 根据年月日生成格式化日期字符串
	 * @param {number|string} year - 年份
	 * @param {number|string} month - 月份（1-12）
	 * @param {number|string} day - 日期（1-31）
	 * @param {string} [format='default'] - 日期格式
	 * - 'default': 默认格式 → YYYY-MM-DD（如 2024-09-25）
	 * - 'cn': 中文格式 → YYYY年MM月DD日（如 2024年09月25日）
	 * - 'short': 简洁格式 → YYYYMMDD（如 20240925）
	 * @returns {string} 格式化后的日期字符串
	 * @throws {Error} 参数无效或格式不支持时抛出错误
	 * @example
	 * // 生成 2024年10月1日 的默认格式
	 * const date1 = Time.formatDate(2024, 10, 1); // "2024-10-01"
	 * // 生成 2024年10月1日 的中文格式
	 * const date2 = Time.formatDate(2024, 10, 1, 'cn'); // "2024年10月01日"
	 */
	static formatDate(year, month, day, format = 'default') {
		// 参数验证
		year = parseInt(year);
		month = parseInt(month);
		day = parseInt(day);
		
		if (isNaN(year) || year < 1000 || year > 9999) {
			throw new Error(`Time.formatDate: 无效的年份 "${year}", 必须是 1000-9999 之间的数字`);
		}
		if (isNaN(month) || month < 1 || month > 12) {
			throw new Error(`Time.formatDate: 无效的月份 "${month}", 必须是 1-12 之间的数字`);
		}
		if (isNaN(day) || day < 1 || day > 31) {
			throw new Error(`Time.formatDate: 无效的日期 "${day}", 必须是 1-31 之间的数字`);
		}

		// 验证日期是否有效（如 2月30日）
		const testDate = new Date(year, month - 1, day);
		if (testDate.getFullYear() !== year || testDate.getMonth() + 1 !== month || testDate.getDate() !== day) {
			throw new Error(`Time.formatDate: 无效的日期组合 "${year}-${month}-${day}"`);
		}

		const yearStr = year.toString();
		const monthStr = this._padZero(month);
		const dayStr = this._padZero(day);

		switch (format.toLowerCase()) {
			case 'default':
				return `${yearStr}-${monthStr}-${dayStr}`;
			case 'cn':
				return `${yearStr}年${monthStr}月${dayStr}日`;
			case 'short':
				return `${yearStr}${monthStr}${dayStr}`;
			default:
				throw new Error(`Time.formatDate: 不支持的格式 "${format}", 可选格式: default/cn/short`);
		}
	}
	/**
	 * 生成指定日期的 ISO 8601 格式时间戳（支持时间偏移）
	 * @param {string} [dateStr] - 日期字符串（可选，默认今天）
	 * - 支持格式: YYYY-MM-DD、YYYY年MM月DD日、YYYYMMDD
	 * @param {number} [hour=16] - 小时（0-23，默认16）
	 * @param {number} [offsetDays=1] - 日期偏移天数（默认+1天，表示实际日期）
	 * @returns {string} ISO 8601 格式的时间戳（如 "2025-10-21T16:00:00.000Z"）
	 * @throws {Error} 日期格式无效或参数超出范围时抛出错误
	 * @example
	 * // 生成表示明天的时间戳（默认今天+1天，16:00）
	 * const timestamp1 = Time.generateISOTimestamp(); 
	 * // 可能返回: "2025-10-21T16:00:00.000Z"（如果今天是2025-10-20）
	 * 
	 * // 生成指定日期的ISO时间戳（日期会自动+1天）
	 * const timestamp2 = Time.generateISOTimestamp("2025-10-20"); 
	 * // 返回: "2025-10-20T16:00:00.000Z"（表示2025-10-21）
	 * 
	 * // 自定义小时和偏移天数
	 * const timestamp3 = Time.generateISOTimestamp("2025-10-20", 14, 2); 
	 * // 返回: "2025-10-20T14:00:00.000Z"（表示2025-10-22）
	 * 
	 * // 用于dacCar函数的recordTime字段
	 * const recordTime = Time.generateISOTimestamp();
	 */
	static generateISOTimestamp(dateStr, hour = 16, offsetDays = 1) {
		// 参数验证
		if (hour < 0 || hour > 23) {
			throw new Error(`Time.generateISOTimestamp: 无效的小时数 "${hour}", 必须在 0-23 之间`);
		}
		
		if (!Number.isInteger(offsetDays)) {
			throw new Error(`Time.generateISOTimestamp: 偏移天数必须是整数, 当前为 ${offsetDays}`);
		}

		let baseDate;
		
		// 解析基础日期
		if (dateStr) {
			baseDate = this._parseDate(dateStr);
		} else {
			// 默认使用今天
			baseDate = new Date();
			baseDate.setHours(0, 0, 0, 0); // 重置时间为00:00:00
		}

		// 应用日期偏移
		const targetDate = new Date(baseDate);
		targetDate.setDate(targetDate.getDate() + offsetDays);
		
		// 设置指定的小时（UTC时间）
		const utcDate = new Date(Date.UTC(
			targetDate.getFullYear(),
			targetDate.getMonth(),
			targetDate.getDate(),
			hour,    // 指定小时
			0,       // 分钟固定为0
			0,       // 秒固定为0
			0        // 毫秒固定为0
		));

		// 生成ISO 8601格式字符串
		return utcDate.toISOString();
	}
	/**
	 * 在指定时间区间内随机生成一个时间字符串
	 * @param {string} startTimeStr - 开始时间字符串 (格式: HH:MM:SS 或 HH:MM)
	 * @param {string} endTimeStr - 结束时间字符串 (格式: HH:MM:SS 或 HH:MM)
	 * @param {string} [format='HH:MM:SS'] - 返回时间格式
	 * - 'HH:MM:SS': 完整格式 (如 "08:50:00")
	 * - 'HH:MM': 简洁格式 (如 "08:50")
	 * @returns {string} 在区间内随机生成的时间字符串
	 * @throws {Error} 时间格式无效或开始时间晚于结束时间时抛出错误
	 * @example
	 * // 在 08:50:00 到 18:35:00 之间随机生成时间
	 * const randomTime1 = Time.getRandomTimeInRange('08:50:00', '18:35:00');
	 * // 可能返回: "14:23:45"
	 * 
	 * // 使用简洁格式返回
	 * const randomTime2 = Time.getRandomTimeInRange('08:50', '18:35', 'HH:MM');
	 * // 可能返回: "14:23"
	 * 
	 * // 使用您配置中的变量
	 * const loginTime = Time.getRandomTimeInRange(
	 *   Global.config.w2.w2_login_range_start, 
	 *   Global.config.w2.w2_login_range_end
	 * );
	 */
	static getRandomTimeInRange(startTimeStr, endTimeStr, format = 'HH:MM:SS') {
		// 时间解析正则表达式 (支持 HH:MM:SS 和 HH:MM 格式)
		const timeRegex = new RegExp("^(\\d{1,2}):(\\d{1,2})(?::(\\d{1,2}))?$");
		
		// 将时间字符串转换为秒数的逻辑
		const parseTimeToSeconds = (timeStr) => {
			const match = timeStr.match(timeRegex);
			if (!match) {
				throw new Error(`Time.getRandomTimeInRange: 无效的时间格式 "${timeStr}", 支持格式: HH:MM:SS 或 HH:MM`);
			}
			
			const hours = parseInt(match[1]);
			const minutes = parseInt(match[2]);
			const seconds = match[3] ? parseInt(match[3]) : 0;
			
			// 参数验证
			if (hours < 0 || hours > 23) {
				throw new Error(`Time.getRandomTimeInRange: 小时必须在 0-23 之间, 当前为 ${hours}`);
			}
			if (minutes < 0 || minutes > 59) {
				throw new Error(`Time.getRandomTimeInRange: 分钟必须在 0-59 之间, 当前为 ${minutes}`);
			}
			if (seconds < 0 || seconds > 59) {
				throw new Error(`Time.getRandomTimeInRange: 秒必须在 0-59 之间, 当前为 ${seconds}`);
			}
			
			return hours * 3600 + minutes * 60 + seconds;
		};
		
		// 将开始时间和结束时间转换为秒数
		const startSeconds = parseTimeToSeconds(startTimeStr);
		const endSeconds = parseTimeToSeconds(endTimeStr);
		
		// 验证时间区间有效性
		if (startSeconds > endSeconds) {
			throw new Error(`Time.getRandomTimeInRange: 开始时间 "${startTimeStr}" 不能晚于或等于结束时间 "${endTimeStr}"`);
		}
		
		// 在区间内随机生成秒数 (包含边界)
		const randomSeconds = Math.floor(Math.random() * (endSeconds - startSeconds + 1)) + startSeconds;
		
		// 将秒数转换为时间字符串
		const hours = Math.floor(randomSeconds / 3600);
		const minutes = Math.floor((randomSeconds % 3600) / 60);
		const seconds = randomSeconds % 60;
		
		const hourStr = this._padZero(hours);
		const minuteStr = this._padZero(minutes);
		const secondStr = this._padZero(seconds);
		
		// 根据格式返回结果
		switch (format.toUpperCase()) {
			case 'HH:MM:SS':
				return `${hourStr}:${minuteStr}:${secondStr}`;
			case 'HH:MM':
				return `${hourStr}:${minuteStr}`;
			default:
				throw new Error(`Time.getRandomTimeInRange: 不支持的输出格式 "${format}", 可选格式: HH:MM:SS/HH:MM`);
		}
	}
}

class TimerScheduler {
	// 存储所有定时器信息，按任务名称存储
	static timers = new Map();
	// 生成唯一内部ID的计数器（仅用于内部管理）
	static timerIdCounter = 0;

	static log = new Logger("TimerScheduler");
	// 私有构造函数, 防止实例化
	constructor() {
		throw new Error('TimerScheduler 是静态类, 不能实例化');
	}

	/**
	 * 每天指定时间点执行任务（支持秒级精度）
	 * @param {string} timeString - 时间字符串，格式为"HH:MM:SS"或"H:M:S"（如"08:00:00"或"8:5:30"）
	 * @param {() => void} callback - 到达指定时间时执行的回调函数
	 * @param {string} taskName - 任务名称, 用于标识和停止任务
	 * @returns {boolean} 任务是否成功设置
	 */
	static setDailyTask(timeString, callback, taskName) {
		// 验证时间字符串格式
		const timeParts = timeString.split(':').map(part => parseInt(part, 10));
		
		if (timeParts.length !== 3 || timeParts.some(isNaN)) {
			throw new Error('无效的时间格式, 请使用"HH:MM:SS"格式');
		}
		
		const [hour, minute, second] = timeParts;
		
		// 验证时间范围
		if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
			throw new Error('无效的时间参数, 小时应在0-23之间, 分钟和秒应在0-59之间');
		}
		
		if (!taskName || typeof taskName !== 'string') {
			throw new Error('任务名称必须是非空字符串');
		}
		
		// 如果已存在同名任务，先停止它
		if (this.timers.has(taskName)) {
			this.stopTask(taskName);
		}
		
		let hasRun = false;
		// 每秒钟检查一次时间
		const timerId = setInterval(() => {
			const now = new Date();
			// 检查当前时间是否与目标时间匹配
			if (now.getHours() === hour && now.getMinutes() === minute && now.getSeconds() === second) {
				if (!hasRun) {
					try {
						callback();
					} catch (err) {
						this.log.error('每日任务执行错误:', err);
					}
					hasRun = true;
				}
			} else {
				hasRun = false;
			}
		}, 1000);
		
		const internalId = `daily_${TimerScheduler.timerIdCounter++}`;
		this.timers.set(taskName, {
			id: timerId,
			internalId: internalId,
			type: 'daily',
			hour,
			minute,
			second,
			timeString,
			name: taskName
		});
		
		this.log.log(`每日任务已设置: ${taskName} (${timeString})`);
		return true;
	}

	/**
	 * 按固定间隔执行任务
	 * @param {(...args: any[]) => void} taskFn - 要执行的任务函数
	 * @param {number} intervalMs - 任务执行间隔, 单位毫秒
	 * @param {string} taskName - 任务名称, 用于标识和停止任务
	 * @param {number|null} [maxCount=null] - 最大执行次数, null表示无限执行
	 * @param {...any} args - 传递给任务函数的参数
	 * @returns {boolean} 任务是否成功设置
	 */
	static setIntervalTask(taskFn, intervalMs, taskName, maxCount = null, ...args) {
		if (intervalMs <= 0) {
			throw new Error('时间间隔必须大于0');
		}
		
		if (!taskName || typeof taskName !== 'string') {
			throw new Error('任务名称必须是非空字符串');
		}
		
		// 如果已存在同名任务，先停止它
		if (this.timers.has(taskName)) {
			this.stopTask(taskName);
		}
		
		let count = 0;
		const timerId = setInterval(() => {
			try {
				taskFn(...args);
			} catch (err) {
				this.log.error('间隔任务执行错误:', err);
			}

			count++;
			if (maxCount !== null && count >= maxCount) {
				this.stopTask(taskName);
			}
		}, intervalMs);
		
		const internalId = `interval_${TimerScheduler.timerIdCounter++}`;
		this.timers.set(taskName, {
			id: timerId,
			internalId: internalId,
			type: 'interval',
			intervalMs,
			maxCount,
			name: taskName,
			executionCount: 0
		});
		
		this.log.log(`间隔任务已设置: ${taskName} (${intervalMs}ms)`);
		return true;
	}

	/**
	 * 停止指定的定时任务
	 * @param {string} taskName - 任务名称
	 * @returns {boolean} 任务是否成功停止
	 */
	static stopTask(taskName) {
		const timerInfo = this.timers.get(taskName);
		if (!timerInfo) {
		this.log.warn(`找不到名称为 "${taskName}" 的任务`);
		return false;
		}
		
		clearInterval(timerInfo.id);
		this.timers.delete(taskName);
		this.log.log(`任务已停止: ${taskName}`);
		return true;
	}

	/**
	 * 停止所有定时任务
	 * @returns {number} 停止的任务数量
	 */
	static stopAllTasks() {
		const taskCount = this.timers.size;
		
		this.timers.forEach((timerInfo, taskName) => {
		clearInterval(timerInfo.id);
		this.log.log(`任务已停止: ${taskName}`);
		});
		
		this.timers.clear();
		this.log.log(`所有定时任务已停止, 共 ${taskCount} 个任务`);
		return taskCount;
	}

	/**
	 * 检查指定任务是否存在且正在运行
	 * @param {string} taskName - 任务名称
	 * @returns {boolean} 任务是否存在
	 */
	static hasTask(taskName) {
		return this.timers.has(taskName);
	}

	/**
	 * 获取指定任务的信息
	 * @param {string} taskName - 任务名称
	 * @returns {Object|null} 任务信息或null
	 */
	static getTaskInfo(taskName) {
		const timerInfo = this.timers.get(taskName);
		if (!timerInfo) {
		return null;
		}
		
		// 返回副本，避免外部修改
		return { ...timerInfo };
	}

	/**
	 * 获取当前所有活跃的定时任务名称列表
	 * @returns {string[]} 所有任务名称的数组
	 */
	static getActiveTaskNames() {
		return Array.from(this.timers.keys());
	}

	/**
	 * 获取当前所有活跃的定时任务信息
	 * @returns {Array} 所有任务信息的数组
	 */
	static getActiveTasks() {
		return Array.from(this.timers.entries()).map(([name, info]) => ({
			name,
			type: info.type,
			intervalMs: info.intervalMs,
			maxCount: info.maxCount,
			hour: info.hour,
			minute: info.minute,
			second: info.second,
			timeString: info.timeString,
			internalId: info.internalId
		}));
	}
}