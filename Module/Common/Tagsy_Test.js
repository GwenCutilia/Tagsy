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
// =======================================
// 消灭 ivu-modal 动画
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

	/* 强制禁止拖拽 transform */
	.ivu-modal-content-drag {
		transform: none !important;
	}
	`;
	document.head.appendChild(style);
})();


// =======================================
// 可视化状态面板
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

const groupedData = [
  {
    "firstXY": {
      "x": 601.09,
      "y": 173.35
    },
    "thirdXY": {
      "x": 625.46,
      "y": 199.87
    },
    "tag": {
      "class_id": -1,
      "description": "访问下一级页面的按钮，当前不可点击"
    }
  },
  {
    "firstXY": {
      "x": 7.06,
      "y": 45.41
    },
    "thirdXY": {
      "x": 59.56,
      "y": 90.11
    },
    "tag": {
      "class_id": 1,
      "description": "打开火狐浏览器"
    }
  },
  {
    "firstXY": {
      "x": 7.82,
      "y": 107.57
    },
    "thirdXY": {
      "x": 59.2,
      "y": 153.39
    },
    "tag": {
      "class_id": 1,
      "description": "打开当前应用"
    }
  },
]
;

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
// 自动填充监听器
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
// 模拟拉框（已加速）
// =======================================
function simulateDraw(canvasEl, startX, startY, endX, endY, steps = 8, onFinish) {
	// steps 从 20 降到 8，大幅加速
	const rect = canvasEl.getBoundingClientRect();

	let x = rect.left + startX;
	let y = rect.top + startY;

	let targetX = rect.left + endX;
	let targetY = rect.top + endY;

	const fireEvent = (type, cx, cy) => {
		canvasEl.dispatchEvent(new MouseEvent(type, {
			bubbles: true,
			cancelable: true,
			clientX: cx,
			clientY: cy
		}));
	};

	fireEvent("mousedown", x, y);

	let dx = (targetX - x) / steps;
	let dy = (targetY - y) / steps;

	let i = 0;
	function stepMove() {
		if (i >= steps) {
			fireEvent("mouseup", targetX, targetY);
			if (typeof onFinish === "function") onFinish();
			return;
		}
		x += dx;
		y += dy;
		fireEvent("mousemove", x, y);
		i++;
		requestAnimationFrame(stepMove);
	}
	requestAnimationFrame(stepMove);
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
// 批量拉框（大幅加速）
// =======================================
async function drawAllRect() {
	const imgWidth = 1920;
	const imgHeight = 1220;
	const canvasWidth = 708.0625;
	const canvasHeight = 692;

	const canvasEl = document.querySelector(".upper-canvas");

	for (let obj of groupedData) {
		const p1 = mapImageToCanvas(obj.firstXY.x, obj.firstXY.y, imgWidth, imgHeight, canvasWidth, canvasHeight);
		const p2 = mapImageToCanvas(obj.thirdXY.x, obj.thirdXY.y, imgWidth, imgHeight, canvasWidth, canvasHeight);

		await new Promise(resolve => {
			simulateDraw(
				canvasEl,
				p1.canvasX + 1,
				p1.canvasY + 10,
				p2.canvasX + 1,
				p2.canvasY + 10,
				8, // ⭐ steps = 8，拉框加速
				async () => {

					// ⭐ 将等待从 1000ms → 150ms
					await new Promise(r => setTimeout(r, 150));

					afterDrawClick();

					resolve();
				}
			);
		});

		// ⭐ 每个框之间等待从 1500ms → 200ms
		await new Promise(r => setTimeout(r, 200));
	}
}


// 调用
drawAllRect();
}
{
	const canvasEl = document.querySelector(".upper-canvas");
const ctx = canvasEl.getContext("2d");

// =======================================
//  真实图片尺寸
// =======================================
const realImgW = 1920;
const realImgH = 1220;

// =======================================
//  虚拟宽度（用于内部映射体系）
// =======================================
const virtualImgW = 1960;

// =======================================
//  canvas 内部尺寸（内部像素）
// =======================================
const canvasW = canvasEl.width;
const canvasH = canvasEl.height;

// =======================================
//  偏差补偿 Y 固定值（单位像素）
// =======================================
const COMP_START_Y = -0.46;  // 起点 Y 偏差
const COMP_END_Y = -4.03;    // 终点 Y 偏差

// =======================================
//  根据给定 imgWidth 计算 scale 和 vertical offset
// =======================================
function computeParamsFor(imgWidth) {
	const scale = canvasW / imgWidth;
	const displayHeight = realImgH * scale;
	const offsetY = (canvasH - displayHeight) / 2;
	return { scale, displayHeight, offsetY };
}

// =======================================
//  绘制红框，框住图片可见区域
// =======================================
function drawRedBoxUsingVirtualWidth(virtualWidth = virtualImgW) {
	const { displayHeight, offsetY } = computeParamsFor(virtualWidth);

	const canvasX = 0;
	const canvasY = offsetY;
	const w = canvasW;
	const h = displayHeight;

	ctx.clearRect(0, 0, canvasW, canvasH);
	ctx.strokeStyle = "red";
	ctx.lineWidth = 2;
	ctx.strokeRect(canvasX, canvasY, w, h);
}

// =======================================
//  真实图片坐标 → 虚拟宽度体系 → canvas 坐标
// =======================================
function mapRealImageCoordToCanvasUsingVirtual(imgX, imgY, virtualWidth = virtualImgW) {
	const xVirtual = imgX * (virtualWidth / realImgW);
	const { scale, offsetY } = computeParamsFor(virtualWidth);
	const canvasX = xVirtual * scale;
	const canvasY = imgY * scale + offsetY;
	return { canvasX, canvasY };
}

// =======================================
//  原始 simulateDraw，不变
// =======================================
function simulateDraw(canvasEl, startX, startY, endX, endY, steps = 8, onFinish) {
	const rect = canvasEl.getBoundingClientRect();

	let x = rect.left + startX;
	let y = rect.top + startY;

	let targetX = rect.left + endX;
	let targetY = rect.top + endY;

	const fireEvent = (type, cx, cy) => {
		canvasEl.dispatchEvent(new MouseEvent(type, {
			bubbles: true,
			cancelable: true,
			clientX: cx,
			clientY: cy
		}));
	};

	fireEvent("mousedown", x, y);

	let dx = (targetX - x) / steps;
	let dy = (targetY - y) / steps;

	let i = 0;
	function stepMove() {
		if (i >= steps) {
			fireEvent("mouseup", targetX, targetY);
			if (typeof onFinish === "function") onFinish();
			return;
		}
		x += dx;
		y += dy;
		fireEvent("mousemove", x, y);
		i++;
		requestAnimationFrame(stepMove);
	}
	requestAnimationFrame(stepMove);
}

// =======================================
//  动态 X 轴补偿函数（根据 X 位置自动计算右下角偏差）
// =======================================
function computeDynamicXCompensation(xReal) {
	// 左上角固定基础偏差
	const base = 1.53;

	// 按比例增加右侧偏差
	const ratio = xReal / realImgW;

	// 最大额外补偿（右下角测得的偏差）
	const extra = 3.04;

	return base + ratio * extra;
}

// =======================================
//  对外接口：模拟绘制（输入真实图片坐标，内部按虚拟宽度 + 动态补偿）
// =======================================
function simulateDrawByRealImageCoordsUsingVirtual(
	imgX1, imgY1, imgX2, imgY2,
	virtualWidth = virtualImgW,
	steps = 8,
	onFinish
) {
	// 先映射到 canvas 坐标
	const p1 = mapRealImageCoordToCanvasUsingVirtual(imgX1, imgY1, virtualWidth);
	const p2 = mapRealImageCoordToCanvasUsingVirtual(imgX2, imgY2, virtualWidth);

	// 获取 scale
	const { scale } = computeParamsFor(virtualWidth);

	// 动态 X 补偿
	const dynamicCompStartX = computeDynamicXCompensation(imgX1);
	const dynamicCompEndX = computeDynamicXCompensation(imgX2);

	// 应用补偿（Y 轴使用固定值）
	const c1x = p1.canvasX - dynamicCompStartX * scale;
	const c1y = p1.canvasY - COMP_START_Y * scale;

	const c2x = p2.canvasX - dynamicCompEndX * scale;
	const c2y = p2.canvasY - COMP_END_Y * scale;

	// 执行模拟绘制
	simulateDraw(canvasEl, c1x, c1y, c2x, c2y, steps, onFinish);
}
}