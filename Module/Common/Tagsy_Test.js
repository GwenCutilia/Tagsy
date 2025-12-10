// /*
// *********************
// 	***动态资源加载器***
// 	支持 JS 和 CSS 文件
// *********************
// */

if (!window.ResourceLoader) {
	class ResourceLoader {
		static resourcesAdded = 0;
		static resourcesTotal = 0;

		constructor() { }

		static getRealUrl() {
			try {
				// 强制获取真实浏览器上下文
				return unsafeWindow.location.href;
			} catch (e) {
				// 退而求其次
				try {
					return document.currentScript.ownerDocument.URL;
				} catch (err) {
					return window.location.href;
				}
			}
		}

		static loadJsAsync(jsUrl) {
			return new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.src = jsUrl + `?v=${Date.now()}`;
				script.dataset.dynamic = "true";
				script.onload = () => resolve(1);
				script.onerror = () => reject(new Error(`Failed to load JS: ${jsUrl}`));
				document.head.appendChild(script);
			});
		}

		static loadCssAsync(cssUrl) {
			return new Promise((resolve, reject) => {
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.href = cssUrl + `?v=${Date.now()}`;
				link.onload = () => resolve(1);
				link.onerror = () => reject(new Error(`Failed to load CSS: ${cssUrl}`));
				document.head.appendChild(link);
			});
		}

		static async loadResourceAsync(url) {
			if (url.endsWith(".css")) {
				try {
					return await ResourceLoader.loadCssAsync(url);
				} catch (err) {
					console.error(err);
					return 0;
				}
			} else if (url.endsWith(".js")) {
				try {
					return await ResourceLoader.loadJsAsync(url);
				} catch (err) {
					console.error(err);
					return 0;
				}
			} else {
				console.warn("Unknown resource type:", url);
				return 0;
			}
		}

		static async loadResourcesParallel(resources) {
			const results = await Promise.all(
				resources.map(url => ResourceLoader.loadResourceAsync(url))
			);
			return results.reduce((sum, v) => sum + v, 0);
		}

		static async loadResourcesByGroups(groups) {
			let totalSuccess = 0;
			for (const group of groups) {
				totalSuccess += await ResourceLoader.loadResourcesParallel(group);
			}
			return totalSuccess;
		}

		static async loadAllResources() {
			const href = ResourceLoader.getRealUrl();

			let Url;

			if (href.startsWith("https://qlabel.tencent.com/workbench/tasks/")) {
				// 使用本地开发服务器
				Url = "http://127.0.0.1:5500/";
			} else {
				// 默认线上地址
				Url = "https://weavefate.asia/";
			}

			const resourceGroups = [
				[
					Url + "Utils/Tool.js",
				],
				[
					Url + "Utils/Manager/Request.js",
					Url + "Utils/Manager/Page.js",
					Url + "Utils/Unit.js",
				],
				[
					Url + "Variable/Global.js",
				],
				[
					Url + "Module/Tagsy_Import.js",
					Url + "Module/Common/Tagsy_Core.js",
				]
			];

			ResourceLoader.resourcesTotal = resourceGroups.flat().length;
			ResourceLoader.resourcesAdded = await ResourceLoader.loadResourcesByGroups(resourceGroups);

			Resource.scriptsNum = ResourceLoader.resourcesTotal;
			Resource.scriptsAdd = ResourceLoader.resourcesAdded;
		}

	}

	window.ResourceLoader = ResourceLoader;
}

// Tagsy_Test.js
async function test() {
	// 初始化设置
	log = new Logger("Test");
	// // =======================================
	// // 可视化状态面板
	// // =======================================
	// const panel = document.createElement("div");
	// panel.style.position = "fixed";
	// panel.style.top = "20px";
	// panel.style.right = "20px";
	// panel.style.zIndex = "999999";
	// panel.style.background = "rgba(0,0,0,0.7)";
	// panel.style.color = "#fff";
	// panel.style.padding = "10px 14px";
	// panel.style.borderRadius = "6px";
	// panel.style.fontSize = "12px";
	// panel.style.fontFamily = "Consolas, monospace";
	// panel.style.whiteSpace = "pre-line";
	// panel.style.pointerEvents = "none";
	// panel.textContent = "ready...";
	// document.body.appendChild(panel);


	// // =======================================
	// // 数据结构
	// // =======================================
	// const groupedData = [];


	// // =======================================
	// // 状态显示
	// // =======================================
	// let fillIndex = 0;

	// function updatePanel() {
	// 	const current = fillIndex - 1;
	// 	const next = fillIndex;

	// 	panel.textContent =
	// 		"Filled index: " + current +
	// 		"\nCurrent: " + (current >= 0 ? JSON.stringify(groupedData[current]) : "none") +
	// 		"\n\nNext index: " + next +
	// 		"\nNext: " + (next < groupedData.length ? JSON.stringify(groupedData[next]) : "no more data");
	// }

	// updatePanel();


	// // =======================================
	// // 自动填充监听器
	// // =======================================
	// const observer = new MutationObserver(() => {
	// 	const elements = document.querySelectorAll(".customInput.horizontalLtr");

	// 	elements.forEach(el => {
	// 		if (el.dataset.filled === "1") return;
	// 		if (fillIndex >= groupedData.length) return;

	// 		const json = JSON.stringify(groupedData[fillIndex].tag);

	// 		el.textContent = json;
	// 		el.dataset.filled = "1";

	// 		el.dispatchEvent(new Event("input", { bubbles: true }));
	// 		el.dispatchEvent(new Event("change", { bubbles: true }));

	// 		fillIndex++;
	// 		updatePanel();
	// 	});
	// });

	// observer.observe(document.body, { childList: true, subtree: true });

	// // =======================================
	// // 需要在拉框后自动点击的按钮
	// // =======================================
	// var add = 0;
	// function afterDrawClick() {
	// 	const btn = document.querySelectorAll(".ivu-btn.ivu-btn-default")[add + 4];
	// 	if (btn) btn.click();
	// 	add += 4;
	// }

	// // =======================================
	// // 模拟拉框
	// // =======================================
	// function simulateDraw(canvasEl, startX, startY, endX, endY, steps = 20, onFinish) {
	// 	const rect = canvasEl.getBoundingClientRect();

	// 	let x = rect.left + startX;
	// 	let y = rect.top + startY;

	// 	let targetX = rect.left + endX;
	// 	let targetY = rect.top + endY;

	// 	const fireEvent = (type, cx, cy) => {
	// 		canvasEl.dispatchEvent(new MouseEvent(type, {
	// 			bubbles: true,
	// 			cancelable: true,
	// 			clientX: cx,
	// 			clientY: cy
	// 		}));
	// 	};

	// 	fireEvent("mousedown", x, y);

	// 	let dx = (targetX - x) / steps;
	// 	let dy = (targetY - y) / steps;

	// 	let i = 0;
	// 	function stepMove() {
	// 		if (i >= steps) {
	// 			fireEvent("mouseup", targetX, targetY);
	// 			if (typeof onFinish === "function") onFinish();  // ⭐ 回调：拉框结束
	// 			return;
	// 		}
	// 		x += dx;
	// 		y += dy;
	// 		fireEvent("mousemove", x, y);
	// 		i++;
	// 		requestAnimationFrame(stepMove);
	// 	}
	// 	requestAnimationFrame(stepMove);
	// }



	// // =======================================
	// // 原图 → 画布坐标映射
	// // =======================================
	// function mapImageToCanvas(imgX, imgY, imgWidth, imgHeight, canvasWidth, canvasHeight) {
	// 	const scale = canvasWidth / imgWidth;
	// 	const offsetY = (canvasHeight - imgHeight * scale) / 2;

	// 	return {
	// 		canvasX: imgX * scale,
	// 		canvasY: imgY * scale + offsetY
	// 	};
	// }



	// // =======================================
	// // 批量拉框 + 拉完自动点击
	// // =======================================
	// async function drawAllRect() {
	// 	const imgWidth = 2880;
	// 	const imgHeight = 1880;
	// 	const canvasWidth = 708.0625;
	// 	const canvasHeight = 692;

	// 	const canvasEl = document.querySelector(".upper-canvas");

	// 	for (let obj of groupedData) {
	// 		const p1 = mapImageToCanvas(obj.firstXY.x, obj.firstXY.y, imgWidth, imgHeight, canvasWidth, canvasHeight);
	// 		const p2 = mapImageToCanvas(obj.thirdXY.x, obj.thirdXY.y, imgWidth, imgHeight, canvasWidth, canvasHeight);

	// 		await new Promise(resolve => {
	// 			simulateDraw(
	// 				canvasEl,
	// 				p1.canvasX,
	// 				p1.canvasY + 11,
	// 				p2.canvasX,
	// 				p2.canvasY + 11,
	// 				20,
	// 				async () => {

	// 					// ⭐ 拉框完成后等待
	// 					await new Promise(r => setTimeout(r, 1000));

	// 					// ⭐ 自动点击按钮
	// 					afterDrawClick();

	// 					resolve();
	// 				}
	// 			);
	// 		});

	// 		// 让每个框之间再慢一点
	// 		await new Promise(r => setTimeout(r, 1500));
	// 	}
	// }



	// // 调用： drawAllRect();
	// drawAllRect();
// =======================================
// 消灭 ivu-modal 动画
// =======================================
// =======================================
// 消灭 ivu-modal 所有动画（完全瞬间出现）
// =======================================
(() => {
	const style = document.createElement("style");
	style.textContent = `
	.ivu-modal,
	.ivu-modal-content,
	.ivu-modal-mask,
	.ivu-modal-content-drag,
	.ivu-fade-enter-active,
	.ivu-fade-leave-active,
	.ivu-modal-enter-active,
	.ivu-modal-leave-active {
		transition: none !important;
		animation: none !important;
	}
	.ivu-modal-content-drag {
		transform: none !important;
	}
	`;
	document.head.appendChild(style);
})();


// =======================================
// 可视化面板
// =======================================
const panel = document.createElement("div");
panel.style.position = "fixed";
panel.style.top = "20px";
panel.style.right = "20px";
panel.style.zIndex = "999999";
panel.style.background = "rgba(0,0,0,0.7)";
panel.style.color = "#fff";
panel.style.padding = "10px 14px";
panel.style.borderRadius = "6px";
panel.style.fontSize = "12px";
panel.style.fontFamily = "Consolas, monospace";
panel.style.whiteSpace = "pre-line";
panel.style.pointerEvents = "none";
panel.textContent = "ready...";
document.body.appendChild(panel);

const groupedData = [];
let fillIndex = 0;

function updatePanel() {
	const current = fillIndex - 1;
	const next = fillIndex;

	panel.textContent =
		"Filled index: " + current +
		"\nCurrent: " + (current >= 0 ? JSON.stringify(groupedData[current]) : "none") +
		"\n\nNext index: " + next +
		"\nNext: " + (next < groupedData.length ? JSON.stringify(groupedData[next]) : "no more data");
}

updatePanel();


// =======================================
// 自动填充
// =======================================
const observer = new MutationObserver(() => {
	const elements = document.querySelectorAll(".customInput.horizontalLtr");

	elements.forEach(el => {
		if (el.dataset.filled === "1") return;
		if (fillIndex >= groupedData.length) return;

		const json = JSON.stringify(groupedData[fillIndex].tag);

		el.textContent = json;
		el.dataset.filled = "1";

		el.dispatchEvent(new Event("input", { bubbles: true }));
		el.dispatchEvent(new Event("change", { bubbles: true }));

		fillIndex++;
		updatePanel();
	});
});

observer.observe(document.body, { childList: true, subtree: true });


// =======================================
// 自动点击按钮
// =======================================
var add = 0;

function afterDrawClick() {
	const btn = document.querySelectorAll(".ivu-btn.ivu-btn-default")[add + 4];
	if (btn) btn.click();
	add += 4;
}


// =======================================
// 极限版本：无动画拉框（直接点起点→终点→鼠标松开）
// =======================================
function superFastDraw(canvasEl, startX, startY, endX, endY, onFinish) {
	const rect = canvasEl.getBoundingClientRect();

	const x1 = rect.left + startX;
	const y1 = rect.top + startY;
	const x2 = rect.left + endX;
	const y2 = rect.top + endY;

	const fire = (type, x, y) => {
		canvasEl.dispatchEvent(new MouseEvent(type, {
			bubbles: true,
			cancelable: true,
			clientX: x,
			clientY: y
		}));
	};

	// 直接三连：mousedown -> mousemove -> mouseup
	fire("mousedown", x1, y1);
	fire("mousemove", x2, y2);
	fire("mouseup", x2, y2);

	if (onFinish) onFinish();
}


// =======================================
// 坐标映射
// =======================================
function mapImageToCanvas(imgX, imgY, imgWidth, imgHeight, canvasWidth, canvasHeight) {
	const scale = canvasWidth / imgWidth;
	const offsetY = (canvasHeight - imgHeight * scale) / 2;

	return {
		canvasX: imgX * scale,
		canvasY: imgY * scale + offsetY
	};
}


// =======================================
// 极致快：无等待批量绘制
// =======================================
async function drawAllRect() {
	const imgWidth = 2880;
	const imgHeight = 1880;
	const canvasWidth = 708.0625;
	const canvasHeight = 692;

	const canvasEl = document.querySelector(".upper-canvas");

	for (let obj of groupedData) {
		const p1 = mapImageToCanvas(obj.firstXY.x, obj.firstXY.y, imgWidth, imgHeight, canvasWidth, canvasHeight);
		const p2 = mapImageToCanvas(obj.thirdXY.x, obj.thirdXY.y, imgWidth, imgHeight, canvasWidth, canvasHeight);

		superFastDraw(
			canvasEl,
			p1.canvasX,
			p1.canvasY + 11,
			p2.canvasX,
			p2.canvasY + 11,
			() => {
				afterDrawClick(); // 无等待立即点击
			}
		);

		// 完全不等待，完全连续快速执行
	}
}

drawAllRect();

}