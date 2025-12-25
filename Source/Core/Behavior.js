class Behavior {
	static log = new Logger("Behavior");
	static tooltip = new ToolTip();
	static ctx = null;
	static _subClasses = new Set();
	static _ready = false;
	
	// 子类自动注册
	static _register(SubClass) {
		this._subClasses.add(SubClass);
	}
	
	// 初始化页面上下文
	static initContext(ctx) {
		this.ctx = ctx;
	}

	// 初始化 domMap
	static initDomMap(domMap) {
		if (!this.ctx) {
			throw new Error("Behavior.initContext must be called before initDomMap");
		}

		const resolvedDom = {};

		const resolve = (obj, target) => {
			for (const [key, value] of Object.entries(obj)) {
				if (typeof value === "string") {
					target[key] = DomHelper.bySelector(value);
				} else if (value && typeof value === "object") {
					target[key] = {};
					resolve(value, target[key]);
				}
			}
		};

		resolve(domMap, resolvedDom);

		// 挂到 Framework 实例
		Object.assign(this.ctx, resolvedDom);

		// 注入到所有 Behavior 子类
		this._subClasses.forEach(SubClass => {
			this._flatten(resolvedDom, SubClass);
		});

		this._ready = true;
	}

	// 只按 domMap key 展开, 不使用 id / className
	static _flatten(source, target) {
		for (const [key, value] of Object.entries(source)) {
			if (value instanceof HTMLElement) {
				target[key] = value;
			} else if (value && typeof value === "object") {
				this._flatten(value, target);
			}
		}
	}

	// 调用安全断言
	static _assertReady() {
		if (!this._ready) {
			throw new Error("Behavior not ready. Call initContext and initDomMap first.");
		}
	}
}
