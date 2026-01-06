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

	// 【目标类名】
	TargetClass = "Qt51514QWindowIcon"
)

// --- 全局状态控制 ---
// 0 = 停止/休息, 1 = 运行/巡逻
var watchState int32 = 0 

// --- API 定义 ---
var (
	user32                       = syscall.NewLazyDLL("user32.dll")
	procFindWindowW              = user32.NewProc("FindWindowW")
	procFindWindowExW            = user32.NewProc("FindWindowExW")
	procGetWindowThreadProcessId = user32.NewProc("GetWindowThreadProcessId")
	procIsWindowVisible          = user32.NewProc("IsWindowVisible")
	procGetWindowRect            = user32.NewProc("GetWindowRect")
	procShowWindow               = user32.NewProc("ShowWindow")
	procSetForegroundWindow      = user32.NewProc("SetForegroundWindow")
	procGetForegroundWindow      = user32.NewProc("GetForegroundWindow")
	procGetCursorPos             = user32.NewProc("GetCursorPos")
	procSetCursorPos             = user32.NewProc("SetCursorPos")
	procMouseEvent               = user32.NewProc("mouse_event")
)

type RECT struct {
	Left, Top, Right, Bottom int32
}

type POINT struct {
	X, Y int32
}

const (
	MOUSEEVENTF_LEFTDOWN = 0x0002
	MOUSEEVENTF_LEFTUP   = 0x0004
	SW_RESTORE           = 9
)

func main() {
	setAutoStart()

	// 1. 启动后台协程 (但它一开始会处于休息状态，因为 watchState 默认为 0)
	go startSilentWatchDog()
	
	simpleLog("服务已启动 (待机模式). 等待指令开启巡逻...")

	// 2. 注册 API
	http.HandleFunc("/start", handleStart)   // 开启巡逻
	http.HandleFunc("/stop", handleStop)     // 停止巡逻
	http.HandleFunc("/status", handleStatus) // 查询状态
	
	http.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		sendJSON(w, true, "Pong", 200)
	})
	http.HandleFunc("/kill", func(w http.ResponseWriter, r *http.Request) {
		sendJSON(w, true, "Bye", 200)
		go func() { time.Sleep(time.Second); os.Exit(0) }()
	})

	http.ListenAndServe(ServerPort, nil)
}

// --- API 处理函数 ---

func handleStart(w http.ResponseWriter, r *http.Request) {
	atomic.StoreInt32(&watchState, 1) // 原子操作：设为 1
	simpleLog("指令接收: 🟢 开始巡逻")
	sendJSON(w, true, "Sentinel Started", 200)
}

func handleStop(w http.ResponseWriter, r *http.Request) {
	atomic.StoreInt32(&watchState, 0) // 原子操作：设为 0
	simpleLog("指令接收: 🔴 停止巡逻")
	sendJSON(w, true, "Sentinel Stopped", 200)
}

func handleStatus(w http.ResponseWriter, r *http.Request) {
	state := atomic.LoadInt32(&watchState)
	msg := "Stopped"
	if state == 1 {
		msg = "Running"
	}
	sendJSON(w, true, msg, 200)
}

// --- 哨兵逻辑 (循环) ---

func startSilentWatchDog() {
	ptrClass, _ := syscall.UTF16PtrFromString(TargetClass)

	for {
		// 【关键检查】如果状态是 0，就睡觉，不干活
		if atomic.LoadInt32(&watchState) == 0 {
			time.Sleep(1 * time.Second)
			continue
		}

		// --- 下面是干活逻辑 ---
		
		// 1. 获取微信 PID
		weixinPID := getWeChatPID()
		if weixinPID == 0 {
			time.Sleep(3 * time.Second)
			continue
		}

		// 2. 检查当前活动窗口 (优先)
		fgHwnd, _, _ := procGetForegroundWindow.Call()
		if fgHwnd != 0 && checkWindow(fgHwnd, weixinPID) {
			simpleLog("⚡ 捕获到活动弹窗，执行点击...")
			if executeClick(fgHwnd) {
				// 点击成功后，自动转入休息模式? 还是继续巡逻?
				// 建议: 继续巡逻，直到 JS 发送 stop，或者休息几秒防止连点
				time.Sleep(3 * time.Second) 
			}
			continue
		}

		// 3. 扫描后台窗口
		var hwnd uintptr = 0
		for {
			hwnd, _, _ = procFindWindowExW.Call(0, hwnd, uintptr(unsafe.Pointer(ptrClass)), 0)
			if hwnd == 0 { break }

			if checkWindow(hwnd, weixinPID) {
				simpleLog("👀 扫描到后台弹窗，执行点击...")
				if executeClick(hwnd) {
					time.Sleep(3 * time.Second)
				}
				break
			}
		}

		// 巡逻间隔
		time.Sleep(800 * time.Millisecond)
	}
}

// --- 检查窗口 ---
func checkWindow(hwnd uintptr, targetPID uint32) bool {
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

// --- 辅助函数 ---

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

func executeClick(hwnd uintptr) bool {
	procShowWindow.Call(hwnd, SW_RESTORE)
	procSetForegroundWindow.Call(hwnd)
	time.Sleep(100 * time.Millisecond)

	var rect RECT
	procGetWindowRect.Call(hwnd, uintptr(unsafe.Pointer(&rect)))
	width := rect.Right - rect.Left
	height := rect.Bottom - rect.Top

	targetX := int32(float64(rect.Left) + float64(width)*0.30)
	targetY := int32(float64(rect.Top) + float64(height)*0.85)

	var oldPos POINT
	procGetCursorPos.Call(uintptr(unsafe.Pointer(&oldPos)))
	
	clickAt(targetX, targetY)
	
	procSetCursorPos.Call(uintptr(oldPos.X), uintptr(oldPos.Y))
	return true
}

func clickAt(x, y int32) {
	procSetCursorPos.Call(uintptr(x), uintptr(y))
	time.Sleep(20 * time.Millisecond)
	procMouseEvent.Call(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
	time.Sleep(20 * time.Millisecond)
	procMouseEvent.Call(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
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