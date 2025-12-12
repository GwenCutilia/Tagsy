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
	 * 将指定元素安全地追加到目标容器中（默认追加到 document.body）
	 * @param {HTMLElement|Node|string|Object} elem - 要追加的元素、HTML字符串或 createDom 的配置对象
	 * @param {HTMLElement} [parent=document.body] - 目标父元素
	 * @returns {HTMLElement|Node|null} 返回追加后的节点，若失败返回 null
	 */
	static append(elem, parent = document.body) {
		if (!parent || !(parent instanceof HTMLElement)) {
			this.log.warn("无效的父元素，必须是 HTMLElement 实例");
			return null;
		}

		let node = null;

		// 如果是字符串，当作HTML片段处理
		if (typeof elem === "string") {
			const temp = document.createElement("div");
			temp.innerHTML = elem.trim();
			node = temp.firstChild;
		}

		// 如果是 createDom 配置对象
		else if (elem && typeof elem === "object" && !(elem instanceof Node)) {
			if (!elem.type) {
				this.log.warn("createDom 配置对象缺少 type 属性");
				return null;
			}
			node = this.createDom(elem.type, elem);
		}

		// 如果是已存在的 Node 节点
		else if (elem instanceof Node) {
			node = elem;
		}

		// 其他情况
		else {
			this.log.warn("append 参数无效");
			return null;
		}

		// 追加到目标父元素
		parent.appendChild(node);
		return node;
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
					resolve(response.response);
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

class ToolTip {
	constructor() {
		this.tooltip = null;
		this.tooltipTimeout = null;
		this.init();
	}
	
	// 初始化工具提示
	init() {
		// 创建工具提示元素
		this.tooltip = DomHelper.createDom('div');
		this.tooltip.id = 'tooltip';
		this.tooltip.className = "fixed z-50 bg-white text-gray-900 text-sm rounded-md px-3 py-2 " +
		"shadow border border-gray-200 max-w-xs pointer-events-none transition-all duration-200 opacity-0 invisible";
		DomHelper.append(this.tooltip);
		this.tooltip = DomHelper.bySelector("#tooltip");
		// 防止工具提示在鼠标移动到它上面时隐藏
		this.tooltip.addEventListener('mouseenter', () => {
			if (this.tooltipTimeout) {
				clearTimeout(this.tooltipTimeout);
				this.tooltipTimeout = null;
			}
		});
		
		this.tooltip.addEventListener('mouseleave', () => {
			this.hide();
		});
	}
	
	// 显示工具提示
	show(text, element) {
		// 清除之前的超时
		if (this.tooltipTimeout) {
			clearTimeout(this.tooltipTimeout);
			this.tooltipTimeout = null;
		}
		
		this.tooltip.textContent = text;
		
		// 获取元素位置
		const rect = element.getBoundingClientRect();
		
		// 计算工具提示位置（在元素上方）
		const tooltipTop = rect.top - this.tooltip.offsetHeight - 7;
		let tooltipLeft = rect.left + (rect.width - this.tooltip.offsetWidth) / 2;
		
		// 确保工具提示不会超出屏幕边界
		if (tooltipLeft < 10) {
			tooltipLeft = 10;
		} else if (tooltipLeft + this.tooltip.offsetWidth > window.innerWidth - 10) {
			tooltipLeft = window.innerWidth - this.tooltip.offsetWidth - 10;
		}
		
		// 设置工具提示位置
		this.tooltip.style.top = `${tooltipTop}px`;
		this.tooltip.style.left = `${tooltipLeft}px`;
		
		// 显示工具提示
		this.tooltip.classList.remove('opacity-0', 'invisible');
		this.tooltip.classList.add('opacity-100', 'visible');
	}
	
	// 隐藏工具提示
	hide() {
		// 使用延迟隐藏，防止鼠标快速移动时闪烁
		this.tooltipTimeout = setTimeout(() => {
			this.tooltip.classList.remove('opacity-100', 'visible');
			this.tooltip.classList.add('opacity-0', 'invisible');
		}, 100);
	}
	
	// 为元素添加工具提示
	addTooltip(element, text) {
		element.addEventListener('mouseenter', (e) => {
			this.show(text, e.currentTarget);
		});
		
		element.addEventListener('mouseleave', () => {
			this.hide();
		});
	}
	
	// 批量添加工具提示
	addTooltips(elements) {
		elements.forEach(item => {
			this.addTooltip(item.element, item.text);
		});
	}
	
	// 销毁工具提示
	destroy() {
		if (this.tooltip && this.tooltip.parentNode) {
			this.tooltip.parentNode.removeChild(this.tooltip);
		}
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
		let normalizedDate = dateStr.trim()
			.replace(new RegExp("年|月", "g"), '-')
			.replace(new RegExp("日", "g"), '');
		
		if (new RegExp("^\\d{8}$").test(normalizedDate)) {
			normalizedDate = `${normalizedDate.slice(0,4)}-${normalizedDate.slice(4,6)}-${normalizedDate.slice(6,8)}`;
		}

		const parsedDate = new Date(normalizedDate);
		if (isNaN(parsedDate.getTime())) {
			throw new Error(`Time._parseDate: 无效的日期格式 "${dateStr}", 支持格式: YYYY-MM-DD/YYYY年MM月DD日/YYYYMMDD`);
		}

		parsedDate.setHours(0, 0, 0, 0);
		return parsedDate;
	}

	/**
	 * 内部工具: 安全解析任意日期字符串 (含 ISO 8601)
	 * @param {string|Date} input - 日期输入 (如 '2025-10-28T00:00:00.000+08:00' 或 '2025-10-28')
	 * @returns {Date} 标准 Date 对象 (时间重置为 00:00:00)
	 */
	static _safeParseDate(input) {
		if (input instanceof Date) {
			const d = new Date(input);
			d.setHours(0, 0, 0, 0);
			return d;
		}

		if (typeof input !== 'string') {
			throw new Error(`Time._safeParseDate: 无效的输入类型 "${typeof input}"`);
		}

		let date;
		try {
			date = new Date(input);
			if (isNaN(date.getTime())) {
				date = this._parseDate(input);
			}
		} catch {
			date = this._parseDate(input);
		}

		date.setHours(0, 0, 0, 0);
		return date;
	}

	/**
	 * 判断两个日期是否为同一天（支持 ISO 字符串）
	 * @param {string|Date} dateA - 日期 A（可为 '2025-10-28T00:00:00.000+08:00'）
	 * @param {string|Date} dateB - 日期 B（同上）
	 * @returns {boolean} true=同一天, false=不同天
	 */
	static isSameDay(dateA, dateB) {
		const a = this._safeParseDate(dateA);
		const b = this._safeParseDate(dateB);
		return a.getTime() === b.getTime();
	}

	/**
	 * 私有静态工具: 给数字补零
	 */
	static _padZero(num) {
		return num.toString().padStart(2, '0');
	}

	static getCurrentDate(format = 'default') {
		const now = new Date();
		const year = now.getFullYear();
		const month = this._padZero(now.getMonth() + 1);
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

	static getCurrentMonth(format = 'default') {
		const now = new Date();
		const month = now.getMonth() + 1;

		switch (format.toLowerCase()) {
			case 'default':
			case 'cn':
				return this._padZero(month);
			case 'number':
				return month.toString();
			default:
				throw new Error(`Time.getCurrentMonth: 不支持的格式 "${format}", 可选格式: default/cn/number`);
		}
	}

	static getCurrentYear(format = 'default') {
		const now = new Date();
		const year = now.getFullYear();

		switch (format.toLowerCase()) {
			case 'default':
			case 'cn':
				return year.toString();
			default:
				throw new Error(`Time.getCurrentYear: 不支持的格式 "${format}", 可选格式: default/cn`);
		}
	}

	static getCurrentMonthBoundary(monthOrType, typeOrFormat, format = 'default') {
		let month, type, finalFormat;
		
		if (typeof monthOrType === 'number' || (typeof monthOrType === 'string' && !isNaN(monthOrType))) {
			month = Number(monthOrType);
			type = typeOrFormat;
			finalFormat = format;
			if (month < 1 || month > 12) {
				throw new Error(`Time.getCurrentMonthBoundary: 月份必须在 1-12 之间, 当前为 ${month}`);
			}
		} else if (typeof monthOrType === 'string') {
			month = new Date().getMonth() + 1;
			type = monthOrType;
			finalFormat = typeOrFormat || 'default';
		} else {
			throw new Error(`Time.getCurrentMonthBoundary: 第一个参数必须是数字或字符串, 当前为 ${typeof monthOrType}`);
		}
		
		if (type !== 'beginDate' && type !== 'endDate') {
			throw new Error(`Time.getCurrentMonthBoundary: 无效的类型 "${type}", 必须是 "beginDate" 或 "endDate"`);
		}

		const now = new Date();
		const year = now.getFullYear();
		
		let dayNumber = type === 'beginDate' ? 1 : new Date(year, month, 0).getDate();
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

	static getFirstDayOfMonthWeek(dateStr) {
		const date = this._parseDate(dateStr);
		const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		return firstDay.getDay();
	}

	static isToday(date) {
		if (typeof date === 'string') {
			date = this._parseDate(date);
		}
		const today = new Date();
		return date.toDateString() === today.toDateString();
	}

	static getTodayTimestamp(hour = 0, minute = 0, second = 0) {
		if (hour < 0 || hour > 23) throw new Error(`Time.getTodayTimestamp: 无效的小时数 "${hour}", 必须在 0-23 之间`);
		if (minute < 0 || minute > 59) throw new Error(`Time.getTodayTimestamp: 无效的分钟数 "${minute}", 必须在 0-59 之间`);
		if (second < 0 || second > 59) throw new Error(`Time.getTodayTimestamp: 无效的秒数 "${second}", 必须在 0-59 之间`);

		const now = new Date();
		const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second);
		return Math.floor(targetTime.getTime() / 1000);
	}

	static isEqual(dateA, dateB) {
		const a = this._parseDate(dateA);
		const b = this._parseDate(dateB);
		return a.getTime() === b.getTime();
	}

	static formatDate(year, month, day, format = 'default') {
		year = parseInt(year);
		month = parseInt(month);
		day = parseInt(day);
		
		if (isNaN(year) || year < 1000 || year > 9999)
			throw new Error(`Time.formatDate: 无效的年份 "${year}", 必须是 1000-9999 之间的数字`);
		if (isNaN(month) || month < 1 || month > 12)
			throw new Error(`Time.formatDate: 无效的月份 "${month}", 必须是 1-12 之间的数字`);
		if (isNaN(day) || day < 1 || day > 31)
			throw new Error(`Time.formatDate: 无效的日期 "${day}", 必须是 1-31 之间的数字`);

		const testDate = new Date(year, month - 1, day);
		if (testDate.getFullYear() !== year || testDate.getMonth() + 1 !== month || testDate.getDate() !== day)
			throw new Error(`Time.formatDate: 无效的日期组合 "${year}-${month}-${day}"`);

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

	static generateISOTimestamp(dateStr, hour = 16, offsetDays = 1) {
		if (hour < 0 || hour > 23)
			throw new Error(`Time.generateISOTimestamp: 无效的小时数 "${hour}", 必须在 0-23 之间`);
		if (!Number.isInteger(offsetDays))
			throw new Error(`Time.generateISOTimestamp: 偏移天数必须是整数, 当前为 ${offsetDays}`);

		let baseDate = dateStr ? this._parseDate(dateStr) : new Date();
		baseDate.setHours(0, 0, 0, 0);

		const targetDate = new Date(baseDate);
		targetDate.setDate(targetDate.getDate() + offsetDays);
		
		const utcDate = new Date(Date.UTC(
			targetDate.getFullYear(),
			targetDate.getMonth(),
			targetDate.getDate(),
			hour, 0, 0, 0
		));

		return utcDate.toISOString();
	}

	static getRandomTimeInRange(startTimeStr, endTimeStr) {
		const timeRegex = new RegExp("^(\\d{1,2}):(\\d{1,2})$");
		const parseTimeToMinutes = (timeStr) => {
			const match = timeStr.match(timeRegex);
			if (!match) throw new Error(`Time.getRandomTimeInRange: 无效的时间格式 "${timeStr}", 支持格式: HH:MM`);
			const hours = parseInt(match[1]);
			const minutes = parseInt(match[2]);
			if (hours < 0 || hours > 23) throw new Error(`Time.getRandomTimeInRange: 小时必须在 0-23 之间, 当前为 ${hours}`);
			if (minutes < 0 || minutes > 59) throw new Error(`Time.getRandomTimeInRange: 分钟必须在 0-59 之间, 当前为 ${minutes}`);
			return hours * 60 + minutes;
		};

		const startMinutes = parseTimeToMinutes(startTimeStr);
		const endMinutes = parseTimeToMinutes(endTimeStr);
		if (startMinutes > endMinutes)
			throw new Error(`Time.getRandomTimeInRange: 开始时间 "${startTimeStr}" 不能晚于结束时间 "${endTimeStr}"`);

		const randomMinutes = Math.floor(Math.random() * (endMinutes - startMinutes + 1)) + startMinutes;
		const hours = Math.floor(randomMinutes / 60);
		const minutes = randomMinutes % 60;
		return `${this._padZero(hours)}:${this._padZero(minutes)}`;
	}

	static generateRandomTimestampInRange(startTime, endTime) {
		const randomTimeStr = Time.getRandomTimeInRange(startTime, endTime, 'HH:MM');
		const today = new Date();
		const [hours, minutes] = randomTimeStr.split(':').map(Number);
		today.setHours(hours, minutes, 0, 0);
		return Math.floor(today.getTime() / 1000);
	};

	/**
	 * 根据给定的时间范围返回两个时间的时间戳
	 * @param {string} timeRange - 时间范围，例如 "13:00-14:00" 或 "13001400"
	 * @returns {[number, number]} 返回的时间戳数组，分别对应时间范围的开始和结束时间
	 */
	static getTimeRangeTimestamp(timeRange) {
		let startTime, endTime;

		// 判断输入格式，若为 'HHMMHHMM' 格式
		const timeRangeRegex = new RegExp("^\\d{4}\\d{4}$");
		if (timeRangeRegex.test(timeRange)) {
			// 将 '13001400' 转换为 '13:00-14:00'
			startTime = timeRange.slice(0, 2) + ':' + timeRange.slice(2, 4);
			endTime = timeRange.slice(4, 6) + ':' + timeRange.slice(6, 8);
		} else {
			// 判断 'HH:MM-HH:MM' 格式
			const rangeRegex = new RegExp("^\\d{2}:\\d{2}-\\d{2}:\\d{2}$");
			if (rangeRegex.test(timeRange)) {
				// 格式已经是 'HH:MM-HH:MM'
				[startTime, endTime] = timeRange.split('-');
			} else {
				throw new Error(`Time.getTimeRangeTimestamp: 无效的时间范围格式 "${timeRange}"，支持格式: "HH:MM-HH:MM" 或 "HHMMHHMM"`);
			}
		}

		// 将时间转换为当天的时间戳
		const startTimestamp = this._getTimestampFromTime(startTime);
		const endTimestamp = this._getTimestampFromTime(endTime);

		return [startTimestamp, endTimestamp];
	}

	/**
	 * 根据给定时间（HH:MM）返回当天的时间戳
	 * @param {string} time - 时间字符串，例如 "13:00"
	 * @returns {number} 返回的时间戳
	 */
	static _getTimestampFromTime(time) {
		const [hours, minutes] = time.split(':').map(Number);
		const today = new Date();

		// 设置当天的小时和分钟
		today.setHours(hours, minutes, 0, 0);

		// 返回时间戳（秒）
		return Math.floor(today.getTime() / 1000);
	}

	static formatTimeRange(rangeStr) {
		const regex = new RegExp(
			"^(\\d{4})-(\\d{2})-(\\d{2})\\s(\\d{2}):(\\d{2}):(\\d{2})\\s-\\s(\\d{4})-(\\d{2})-(\\d{2})\\s(\\d{2}):(\\d{2}):(\\d{2})$"
		);
		const match = rangeStr.match(regex);
		if (!match) {
			throw new Error('Time.formatTimeRange: 无效的时间范围格式 "' + rangeStr + '", 需要格式: "YYYY-MM-DD HH:MM:SS - YYYY-MM-DD HH:MM:SS"');
		}

		const [
			_,
			year1, month1, day1, hour1, min1, sec1,
			year2, month2, day2, hour2, min2, sec2
		] = match;

		if (year1 !== year2 || month1 !== month2 || day1 !== day2) {
			throw new Error('Time.formatTimeRange: 时间范围跨天 (' + year1 + '-' + month1 + '-' + day1 + ' ≠ ' + year2 + '-' + month2 + '-' + day2 + ')');
		}

		// 返回 HTML 格式字符串（中间换行）
		return [month1 + '-' + day1, + hour1 + ':' + min1 + '-' + hour2 + ':' + min2];
	}
	/**
	 * 根据今天的日期生成一个偏移后的时间范围
	 * @param {number} offsetStart - 相对今天的起始偏移天数(负数为过去, 正数为未来)
	 * @param {number} offsetEnd - 相对今天的结束偏移天数(负数为过去, 正数为未来)
	 * @returns {[string, string]} 返回 ["2025-09-15", "2025-10-15"] 这样的数组
	 */
	static getDateRangeByToday(offsetStart, offsetEnd) {
		if (!Number.isInteger(offsetStart) || !Number.isInteger(offsetEnd)) {
			throw new Error(`Time.getDateRangeByToday: 参数必须为整数, 当前为 ${offsetStart}, ${offsetEnd}`);
		}

		const today = new Date();

		// 计算偏移后的开始与结束日期
		const beginDate = new Date(today);
		beginDate.setDate(today.getDate() + offsetStart);

		const endDate = new Date(today);
		endDate.setDate(today.getDate() + offsetEnd);

		// 格式化函数
		const format = (d) => {
			const y = d.getFullYear();
			const m = (d.getMonth() + 1).toString().padStart(2, '0');
			const day = d.getDate().toString().padStart(2, '0');
			return `${y}-${m}-${day}`;
		};

		return [format(beginDate), format(endDate)];
	}
	/**
	 * 计算今天截至当前时间已经工作的小时数
	 * @returns {number} 已工作的小时数，小数形式
	 */
	static getWorkedHoursToday() {
		const now = new Date();
		const currentMinutes = now.getHours() * 60 + now.getMinutes();

		// 定义工作时间段（分钟）
		const workPeriods = [
			[9 * 60, 12 * 60],   // 上午 09:00-12:00
			[13 * 60 + 30, 18 * 60 + 30]   // 下午 13:30-18:30
		];

		let workedMinutes = 0;

		for (const [start, end] of workPeriods) {
			if (currentMinutes >= end) {
				// 整个时段已经过去
				workedMinutes += (end - start);
			} else if (currentMinutes > start && currentMinutes < end) {
				// 当前在该时段中
				workedMinutes += (currentMinutes - start);
			}
			// 当前时间在该时段之前，则不计
		}

		// 转换为小时数
		return workedMinutes / 60;
	}
}

class TimerScheduler {
	static dailyTasks = new Map();      // 每日任务
	static intervalTasks = new Map();   // 间隔任务
	static mainTimer = null;
	static checkInterval = 1000; // 每秒检查一次
	static timerIdCounter = 0;
	static log = new Logger("TimerScheduler");

	constructor() {
		throw new Error("TimerScheduler 是静态类, 不能实例化");
	}

	// 启动主定时器
	static startMainTimer() {
		if (!this.mainTimer) {
			this.mainTimer = setInterval(() => {
				this.checkDailyTasks();
				this.checkIntervalTasks();
			}, this.checkInterval);
			this.log.log("主定时器已启动");
		}
	}

	// 若无任务则停止主定时器
	static stopMainTimerIfNoTasks() {
		if (this.dailyTasks.size === 0 && this.intervalTasks.size === 0) {
			if (this.mainTimer) {
				clearInterval(this.mainTimer);
				this.mainTimer = null;
				this.log.log("主定时器已停止（无任务运行）");
			}
		}
	}

	/**
	 * 检查并执行每日任务 (按小时和分钟)
	 */
	static checkDailyTasks() {
		const now = new Date();
		const currentHour = now.getHours();
		const currentMinute = now.getMinutes();

		this.dailyTasks.forEach((taskInfo, taskName) => {
			// 如果时间匹配
			if (currentHour === taskInfo.hour && currentMinute === taskInfo.minute) {
				// 防止同一分钟多次执行
				if (!taskInfo.hasRunThisMinute) {
					try {
						taskInfo.callback();
					} catch (err) {
						this.log.error(`每日任务执行错误 (${taskName}):`, err);
					}
					taskInfo.hasRunThisMinute = true;
				}
			} else {
				// 时间不匹配时重置标志
				taskInfo.hasRunThisMinute = false;
			}
		});
	}

	/**
	 * 检查并执行间隔任务
	 */
	static checkIntervalTasks() {
		const now = Date.now();
		this.intervalTasks.forEach((taskInfo, taskName) => {
			if (now - taskInfo.lastExecutionTime >= taskInfo.intervalMs) {
				try {
					taskInfo.callback(...taskInfo.args);
				} catch (err) {
					this.log.error(`间隔任务执行错误 (${taskName}):`, err);
				}
				taskInfo.lastExecutionTime = now;
				taskInfo.executionCount++;
				if (taskInfo.maxCount !== null && taskInfo.executionCount >= taskInfo.maxCount) {
					this.stopTask(taskName);
				}
			}
		});
	}

	/**
	 * 每天指定时间点执行任务（按分钟）
	 * @param {string} timeString - 格式: "HH:MM"
	 * @param {() => void} callback - 到达时间时执行的回调
	 * @param {string} taskName - 任务名称
	 * @returns {boolean}
	 */
	static setDailyTask(timeString, callback, taskName) {
		const timeParts = timeString.split(":").map(part => parseInt(part, 10));
		if (timeParts.length !== 2 || timeParts.some(isNaN)) {
			throw new Error('无效的时间格式, 请使用 "HH:MM"');
		}
		const [hour, minute] = timeParts;
		if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
			throw new Error("无效的时间参数, 小时应在0-23之间, 分钟应在0-59之间");
		}
		if (!taskName || typeof taskName !== "string") {
			throw new Error("任务名称必须是非空字符串");
		}
		if (this.dailyTasks.has(taskName)) {
			this.stopTask(taskName);
		}
		const internalId = `daily_${TimerScheduler.timerIdCounter++}`;
		this.dailyTasks.set(taskName, {
			internalId,
			type: "daily",
			hour,
			minute,
			timeString,
			name: taskName,
			callback,
			hasRunThisMinute: false
		});
		this.startMainTimer();
		this.log.log(`每日任务已设置: ${taskName} (${timeString})`);
		return true;
	}

	// 设置间隔任务
	static setIntervalTask(taskFn, intervalMs, taskName, maxCount = null, ...args) {
		if (intervalMs <= 0) throw new Error("时间间隔必须大于0");
		if (!taskName || typeof taskName !== "string") throw new Error("任务名称必须是非空字符串");
		if (this.intervalTasks.has(taskName)) this.stopTask(taskName);

		const internalId = `interval_${TimerScheduler.timerIdCounter++}`;
		this.intervalTasks.set(taskName, {
			internalId,
			type: "interval",
			intervalMs,
			maxCount,
			name: taskName,
			callback: taskFn,
			args,
			lastExecutionTime: Date.now(),
			executionCount: 0
		});
		this.startMainTimer();
		this.log.log(`间隔任务已设置: ${taskName} (${intervalMs}ms)`);
		return true;
	}

	// 停止单个任务
	static stopTask(taskName) {
		let stopped = false;
		if (this.dailyTasks.has(taskName)) {
			this.dailyTasks.delete(taskName);
			this.log.log(`每日任务已停止: ${taskName}`);
			stopped = true;
		}
		if (this.intervalTasks.has(taskName)) {
			this.intervalTasks.delete(taskName);
			this.log.log(`间隔任务已停止: ${taskName}`);
			stopped = true;
		}
		if (!stopped) {
			this.log.warn(`找不到名称为 "${taskName}" 的任务`);
			return false;
		}
		this.stopMainTimerIfNoTasks();
		return true;
	}

	// 停止所有任务
	static stopAllTasks() {
		const dailyCount = this.dailyTasks.size;
		const intervalCount = this.intervalTasks.size;
		const totalCount = dailyCount + intervalCount;
		this.dailyTasks.clear();
		this.intervalTasks.clear();
		if (this.mainTimer) {
			clearInterval(this.mainTimer);
			this.mainTimer = null;
		}
		this.log.log(`所有定时任务已停止, 共 ${totalCount} 个任务`);
		return totalCount;
	}

	static hasTask(taskName) {
		return this.dailyTasks.has(taskName) || this.intervalTasks.has(taskName);
	}

	static getTaskInfo(taskName) {
		const info = this.dailyTasks.get(taskName) || this.intervalTasks.get(taskName);
		if (!info) return null;
		const copy = { ...info };
		delete copy.callback;
		delete copy.args;
		return copy;
	}

	static getActiveTaskNames() {
		return [...this.dailyTasks.keys(), ...this.intervalTasks.keys()];
	}

	static getActiveTasks() {
		const daily = Array.from(this.dailyTasks.entries()).map(([name, info]) => ({
			name,
			type: info.type,
			hour: info.hour,
			minute: info.minute,
			timeString: info.timeString,
			internalId: info.internalId
		}));
		const interval = Array.from(this.intervalTasks.entries()).map(([name, info]) => ({
			name,
			type: info.type,
			intervalMs: info.intervalMs,
			maxCount: info.maxCount,
			executionCount: info.executionCount,
			internalId: info.internalId
		}));
		return [...daily, ...interval];
	}

	static getStats() {
		return {
			dailyTasks: this.dailyTasks.size,
			intervalTasks: this.intervalTasks.size,
			totalTasks: this.dailyTasks.size + this.intervalTasks.size,
			mainTimerRunning: this.mainTimer !== null,
			checkInterval: this.checkInterval
		};
	}
}

class FormatValidation {
	// 校验时间格式，支持 "13:00-14:00" 或 "13001400"
	static validateTime(timeText) {
		// 正则匹配 "13:00-14:00" 格式
		const timeRangeRegex = new RegExp("^\\d{2}:\\d{2}-\\d{2}:\\d{2}$");

		// 正则匹配 "13001400" 格式
		const timeCompactRegex = new RegExp("^\\d{4}\\d{4}$");

		// 如果时间匹配其中一个格式，返回true，否则返回false
		if (timeRangeRegex.test(timeText) || timeCompactRegex.test(timeText)) {
			return true;
		} else {
			return false;
		}
	}

	// 校验备注内容是否仅包含汉字、数字或英文
	static validateMomo(momoText) {
		// 校验是否为汉字、数字或英文
		const momoRegex = new RegExp("^[\\u4e00-\\u9fa5a-zA-Z0-9]+$");
		return momoRegex.test(momoText);
	}
}
/**
 * Message 类 - 管理应用程序的通知功能(桌面通知)
 */
class Message {
	static log = new Logger("Resource");
	static async init() {
		if (!("Notification" in window)) {
			this.log.warn("当前浏览器不支持桌面通知");
			return;
		}
		if (Notification.permission === "default") {
			await Notification.requestPermission();
		}
	}

	static notify(options = {}) {
		const {
			title = "Tagsy",
			body = "",
			duration = 10000
		} = options;

		if (Notification.permission !== "granted") {
			this.log.warn("通知未授权");
			return;
		}

		const n = new Notification(title, {
			body,
		});

		// 点击通知后回到当前网页
		n.onclick = () => {
			window.focus();
		};

		if (duration > 0) {
			setTimeout(() => n.close(), duration);
		}

		return n;
	}
}
