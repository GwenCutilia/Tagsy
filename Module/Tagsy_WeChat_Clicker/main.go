package main

import (
	"encoding/json"
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
	TargetClass = "Qt51514QWindowIcon"
	AppName     = "TagsyWeChatAgent"
)

// --- JSON 响应结构体 ---
type JsonResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Code    int    `json:"code"`
}

// --- Windows API 定义 ---
var (
	user32                  = syscall.NewLazyDLL("user32.dll")
	procFindWindowW         = user32.NewProc("FindWindowW")
	procSetForegroundWindow = user32.NewProc("SetForegroundWindow")
	procGetWindowRect       = user32.NewProc("GetWindowRect")
	procGetCursorPos        = user32.NewProc("GetCursorPos") // 【新增】获取鼠标位置
	procSetCursorPos        = user32.NewProc("SetCursorPos")
	procMouseEvent          = user32.NewProc("mouse_event")
)

type RECT struct {
	Left, Top, Right, Bottom int32
}

// 【新增】坐标结构体
type POINT struct {
	X, Y int32
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
	http.HandleFunc("/ping", handlePing)

	// 3. 启动服务
	http.ListenAndServe(ServerPort, nil)
}

// --- HTTP 处理函数 ---

func handlePing(w http.ResponseWriter, r *http.Request) {
	sendJSON(w, true, "Pong", 200)
}

func handleClick(w http.ResponseWriter, r *http.Request) {
	clicked, msg := doClick()
	if clicked {
		sendJSON(w, true, "点击成功: "+msg, 200)
	} else {
		sendJSON(w, false, "未找到微信窗口或操作失败", 404)
	}
}

func handleKill(w http.ResponseWriter, r *http.Request) {
	sendJSON(w, true, "服务正在停止...", 200)
	go func() {
		time.Sleep(1 * time.Second)
		os.Exit(0)
	}()
}

func sendJSON(w http.ResponseWriter, success bool, message string, code int) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	resp := JsonResponse{
		Success: success,
		Message: message,
		Code:    code,
	}
	json.NewEncoder(w).Encode(resp)
}

// --- 自动化逻辑 ---
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

	// 1. 【新增】记录当前鼠标在哪里
	var oldPos POINT
	procGetCursorPos.Call(uintptr(unsafe.Pointer(&oldPos)))

	// 2. 正常流程：激活窗口、计算坐标
	procSetForegroundWindow.Call(hwnd)
	time.Sleep(100 * time.Millisecond)

	var rect RECT
	procGetWindowRect.Call(hwnd, uintptr(unsafe.Pointer(&rect)))

	width := rect.Right - rect.Left
	height := rect.Bottom - rect.Top

	targetX := int32(float64(rect.Left) + float64(width)*0.30)
	targetY := int32(float64(rect.Top) + float64(height)*0.85)

	// 3. 执行点击 (鼠标瞬移过去点一下)
	clickAt(targetX, targetY)

	// 4. 【新增】把鼠标瞬间移回去 (用户无感知)
	procSetCursorPos.Call(uintptr(oldPos.X), uintptr(oldPos.Y))

	return true, fmt.Sprintf("Clicked at (%d, %d)", targetX, targetY)
}

func clickAt(x, y int32) {
	procSetCursorPos.Call(uintptr(x), uintptr(y))
	time.Sleep(20 * time.Millisecond) // 稍微快一点
	procMouseEvent.Call(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
	time.Sleep(20 * time.Millisecond)
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