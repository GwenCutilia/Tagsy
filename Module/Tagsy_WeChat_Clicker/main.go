package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sync/atomic"
	"syscall"
	"time"
	"unsafe"

	"golang.org/x/sys/windows/registry"
)

// --- 配置区域 ---
const (
	ServerPort = ":5555"
	AppName    = "TagsyWeChatAgent"

	// 【尺寸指纹】
	TargetW_Min = 300
	TargetW_Max = 420
	TargetH_Min = 200
	TargetH_Max = 320

	TargetClass = "Qt51514QWindowIcon"
)

// --- 全局状态 ---
var watchState int32 = 0

// --- API 定义 ---
var (
	user32                       = syscall.NewLazyDLL("user32.dll")
	procFindWindowW              = user32.NewProc("FindWindowW")
	procFindWindowExW            = user32.NewProc("FindWindowExW")
	procGetWindowThreadProcessId = user32.NewProc("GetWindowThreadProcessId")
	procIsWindowVisible          = user32.NewProc("IsWindowVisible")
	procGetWindowRect            = user32.NewProc("GetWindowRect")
	
	// 【关键变化】使用 PostMessageW 代替鼠标事件
	procPostMessageW             = user32.NewProc("PostMessageW")
)

type RECT struct {
	Left, Top, Right, Bottom int32
}

const (
	// Windows 消息常量
	WM_LBUTTONDOWN = 0x0201
	WM_LBUTTONUP   = 0x0202
	MK_LBUTTON     = 0x0001
)

func main() {
	setAutoStart()

	// 启动哨兵
	go startSilentWatchDog()
	
	simpleLog("后台消息点击服务已启动 (支持锁屏运行)...")

	http.HandleFunc("/start", handleStart)
	http.HandleFunc("/stop", handleStop)
	http.HandleFunc("/status", handleStatus)
	
	http.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		sendJSON(w, true, "Pong", 200)
	})
	http.HandleFunc("/kill", func(w http.ResponseWriter, r *http.Request) {
		sendJSON(w, true, "Bye", 200)
		go func() { time.Sleep(time.Second); os.Exit(0) }()
	})

	http.ListenAndServe(ServerPort, nil)
}

// --- API Handlers ---
func handleStart(w http.ResponseWriter, r *http.Request) {
	atomic.StoreInt32(&watchState, 1)
	simpleLog("🟢 哨兵已激活")
	sendJSON(w, true, "Started", 200)
}

func handleStop(w http.ResponseWriter, r *http.Request) {
	atomic.StoreInt32(&watchState, 0)
	simpleLog("🔴 哨兵已暂停")
	sendJSON(w, true, "Stopped", 200)
}

func handleStatus(w http.ResponseWriter, r *http.Request) {
	state := atomic.LoadInt32(&watchState)
	msg := "Stopped"
	if state == 1 { msg = "Running" }
	sendJSON(w, true, msg, 200)
}

// --- 哨兵循环 ---
func startSilentWatchDog() {
	ptrClass, _ := syscall.UTF16PtrFromString(TargetClass)

	for {
		if atomic.LoadInt32(&watchState) == 0 {
			time.Sleep(1 * time.Second)
			continue
		}

		weixinPID := getWeChatPID()
		if weixinPID == 0 {
			time.Sleep(3 * time.Second)
			continue
		}

		// 遍历所有微信窗口
		var hwnd uintptr = 0
		for {
			hwnd, _, _ = procFindWindowExW.Call(0, hwnd, uintptr(unsafe.Pointer(ptrClass)), 0)
			if hwnd == 0 { break }

			if checkWindow(hwnd, weixinPID) {
				simpleLog("⚡ 发现弹窗，发送后台点击消息...")
				
				// 执行后台点击
				if executeBackgroundClick(hwnd) {
					// 点完多休息一会，等待窗口销毁
					time.Sleep(2 * time.Second)
				}
				break
			}
		}
		time.Sleep(500 * time.Millisecond)
	}
}

// --- 【核心】后台点击逻辑 ---
func executeBackgroundClick(hwnd uintptr) bool {
	var rect RECT
	procGetWindowRect.Call(hwnd, uintptr(unsafe.Pointer(&rect)))
	width := rect.Right - rect.Left
	height := rect.Bottom - rect.Top

	// 计算相对于窗口左上角的坐标 (不是屏幕坐标!)
	// 允许按钮位置: X=30%, Y=85%
	x := int32(float64(width) * 0.30)
	y := int32(float64(height) * 0.85)

	// 构造 lParam: 高16位是Y，低16位是X
	lParam := uintptr((y << 16) | (x & 0xFFFF))

	// 1. 发送左键按下消息
	// PostMessageW(hwnd, Msg, wParam, lParam)
	procPostMessageW.Call(hwnd, WM_LBUTTONDOWN, MK_LBUTTON, lParam)
	
	// 稍微停顿，模拟真实点击
	time.Sleep(50 * time.Millisecond)
	
	// 2. 发送左键抬起消息
	procPostMessageW.Call(hwnd, WM_LBUTTONUP, 0, lParam)

	simpleLog(fmt.Sprintf("已向窗口发送点击指令 (坐标: %d, %d)", x, y))
	return true
}

func checkWindow(hwnd uintptr, targetPID uint32) bool {
	// 注意：锁屏状态下 IsWindowVisible 依然为真，所以这个检查是有效的
	isVisible, _, _ := procIsWindowVisible.Call(hwnd)
	if isVisible == 0 { return false }

	var pid uint32
	procGetWindowThreadProcessId.Call(hwnd, uintptr(unsafe.Pointer(&pid)))
	if pid != targetPID { return false }

	var rect RECT
	procGetWindowRect.Call(hwnd, uintptr(unsafe.Pointer(&rect)))
	width := rect.Right - rect.Left
	height := rect.Bottom - rect.Top

	if width >= TargetW_Min && width <= TargetW_Max &&
	   height >= TargetH_Min && height <= TargetH_Max {
		return true
	}
	return false
}

func getWeChatPID() uint32 {
	ptrClass, _ := syscall.UTF16PtrFromString(TargetClass)
	hwnd, _, _ := procFindWindowW.Call(uintptr(unsafe.Pointer(ptrClass)), 0)
	if hwnd == 0 {
		ptrTitle, _ := syscall.UTF16PtrFromString("微信")
		hwnd, _, _ = procFindWindowW.Call(0, uintptr(unsafe.Pointer(ptrTitle)))
	}
	if hwnd != 0 {
		var pid uint32
		procGetWindowThreadProcessId.Call(hwnd, uintptr(unsafe.Pointer(&pid)))
		return pid
	}
	return 0
}

func sendJSON(w http.ResponseWriter, success bool, message string, code int) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
		Code    int    `json:"code"`
	}{success, message, code})
}

func simpleLog(msg string) {
	fmt.Println(time.Now().Format("15:04:05"), msg)
}

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