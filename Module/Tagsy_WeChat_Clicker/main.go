package main

import (
	"encoding/json" // 新增：用于处理 JSON
	"fmt"
	"net/http"
	"os"
	"syscall"
	"time"
	"unsafe"

	"golang.org/x/sys/windows/registry"
)

// --- 配置区域 ---
const (
	ServerPort  = ":5555"
	TargetTitle = "微信"
	TargetClass = "Qt51514QWindowIcon" // 之前侦测到的类名
	AppName     = "TagsyWeChatAgent"   // 稍微改了个名字，更符合你的项目
)

// --- JSON 响应结构体 ---
type JsonResponse struct {
	Success bool   `json:"success"` // true/false
	Message string `json:"message"` // 提示信息
	Code    int    `json:"code"`    // 状态码 (200, 404等)
}

// --- Windows API 定义 ---
var (
	user32                  = syscall.NewLazyDLL("user32.dll")
	procFindWindowW         = user32.NewProc("FindWindowW")
	procSetForegroundWindow = user32.NewProc("SetForegroundWindow")
	procGetWindowRect       = user32.NewProc("GetWindowRect")
	procSetCursorPos        = user32.NewProc("SetCursorPos")
	procMouseEvent          = user32.NewProc("mouse_event")
)

type RECT struct {
	Left, Top, Right, Bottom int32
}

const (
	MOUSEEVENTF_LEFTDOWN = 0x0002
	MOUSEEVENTF_LEFTUP   = 0x0004
)

func main() {
	// 1. 开机自启
	setAutoStart()

	// 2. 注册路由
	http.HandleFunc("/click", handleClick)
	http.HandleFunc("/kill", handleKill)

	// 3. 启动服务
	// fmt.Println("Agent is running on port " + ServerPort) 
	http.ListenAndServe(ServerPort, nil)
}

// --- HTTP 处理函数 ---

func handleClick(w http.ResponseWriter, r *http.Request) {
	// 核心逻辑：执行点击
	clicked, msg := doClick()

	// 返回 JSON
	if clicked {
		sendJSON(w, true, "点击成功: "+msg, 200)
	} else {
		sendJSON(w, false, "未找到微信窗口或操作失败", 404)
	}
}

func handleKill(w http.ResponseWriter, r *http.Request) {
	sendJSON(w, true, "服务正在停止...", 200)
	
	// 异步退出，确保 JSON 能发出去
	go func() {
		time.Sleep(1 * time.Second)
		os.Exit(0)
	}()
}

// --- 辅助函数：统一发送 JSON ---
func sendJSON(w http.ResponseWriter, success bool, message string, code int) {
	// 1. 允许跨域 (Chrome Extension 必须)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	// 2. 设置内容类型为 JSON
	w.Header().Set("Content-Type", "application/json")
	
	// 3. 构造数据
	resp := JsonResponse{
		Success: success,
		Message: message,
		Code:    code,
	}

	// 4. 编码并发送
	json.NewEncoder(w).Encode(resp)
}

// --- 自动化逻辑 (保持之前针对 Qt 窗口的算法) ---
func doClick() (bool, string) {
	ptrClass, _ := syscall.UTF16PtrFromString(TargetClass)
	ptrTitle, _ := syscall.UTF16PtrFromString(TargetTitle)
	
	hwnd, _, _ := procFindWindowW.Call(
		uintptr(unsafe.Pointer(ptrClass)),
		uintptr(unsafe.Pointer(ptrTitle)),
	)

	if hwnd == 0 {
		return false, "Window not found"
	}

	procSetForegroundWindow.Call(hwnd)
	time.Sleep(100 * time.Millisecond)

	var rect RECT
	procGetWindowRect.Call(hwnd, uintptr(unsafe.Pointer(&rect)))

	width := rect.Right - rect.Left
	height := rect.Bottom - rect.Top

	// 坐标算法：宽度的 30% (左下), 高度的 85% (靠下)
	targetX := int32(float64(rect.Left) + float64(width)*0.30)
	targetY := int32(float64(rect.Top) + float64(height)*0.85)

	clickAt(targetX, targetY)

	return true, fmt.Sprintf("Clicked at (%d, %d)", targetX, targetY)
}

func clickAt(x, y int32) {
	procSetCursorPos.Call(uintptr(x), uintptr(y))
	time.Sleep(50 * time.Millisecond)
	procMouseEvent.Call(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
	time.Sleep(50 * time.Millisecond)
	procMouseEvent.Call(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
}

// --- 自启逻辑 ---
func setAutoStart() {
	exePath, err := os.Executable()
	if err != nil { return }
	k, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.QUERY_VALUE|registry.SET_VALUE)
	if err != nil { return }
	defer k.Close()
	val, _, err := k.GetStringValue(AppName)
	if err == nil && val == exePath { return }
	k.SetStringValue(AppName, exePath)
}